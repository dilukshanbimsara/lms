import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResultSheetDto } from './dto/create-result-sheet.dto';

const RESULT_STUDENT_SELECT = {
  id: true,
  studentNumber: true,
  name: true,
  subject: true,
  examYear: true,
  examLevel: true,
  institutionId: true,
};

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const sheets = await this.prisma.resultSheet.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { results: true } } },
    });
    return sheets.map((s) => ({
      id: s.id,
      title: s.title,
      year: s.year,
      examDate: (s as any).examDate ?? '',
      description: (s as any).description ?? undefined,
      gradeRanges: s.gradeRanges,
      institutionIds: s.institutionIds,
      institutionCount: (s.institutionIds as string[]).length,
      studentCount: s._count.results,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async findOne(id: string) {
    const sheet = await this.prisma.resultSheet.findUnique({
      where: { id },
      include: {
        results: {
          include: { student: { select: RESULT_STUDENT_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!sheet) throw new NotFoundException('Result sheet not found');
    return {
      id: sheet.id,
      title: sheet.title,
      year: sheet.year,
      examDate: (sheet as any).examDate ?? '',
      description: (sheet as any).description ?? undefined,
      gradeRanges: sheet.gradeRanges,
      institutionIds: sheet.institutionIds,
      results: sheet.results.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        studentNumber: r.student.studentNumber,
        studentName: r.student.name,
        subject: r.student.subject,
        mark: r.mark,
        grade: r.grade,
        note: r.note ?? '',
      })),
      createdAt: sheet.createdAt,
      updatedAt: sheet.updatedAt,
    };
  }

  async create(dto: CreateResultSheetDto) {
    console.log('Creating result sheet with data:', dto);
    const sheet = await this.prisma.resultSheet.create({
      data: {
        title: dto.title,
        year: dto.year,
        examDate: dto.examDate,
        description: dto.description,
        gradeRanges: dto.gradeRanges as any,
        institutionIds: dto.institutionIds as any,
        results: {
          create: (dto.results ?? []).map((r) => ({
            studentId: r.studentId,
            mark: r.mark ?? null,
            grade: r.grade ?? null,
            note: r.note ?? null,
          })),
        },
      },
    });
    return this.findOne(sheet.id);
  }

  async update(id: string, dto: CreateResultSheetDto) {
    await this.findOne(id);
    await this.prisma.studentResult.deleteMany({ where: { resultSheetId: id } });
    const sheet = await this.prisma.resultSheet.update({
      where: { id },
      data: {
        title: dto.title,
        year: dto.year,
        examDate: dto.examDate,
        description: dto.description,
        gradeRanges: dto.gradeRanges as any,
        institutionIds: dto.institutionIds as any,
        results: {
          create: (dto.results ?? []).map((r) => ({
            studentId: r.studentId,
            mark: r.mark ?? null,
            grade: r.grade ?? null,
            note: r.note ?? null,
          })),
        },
      },
    });
    return this.findOne(sheet.id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.resultSheet.delete({ where: { id } });
  }

  async findMyResults(studentId: string) {
    const rows = await this.prisma.studentResult.findMany({
      where: { studentId },
      include: {
        resultSheet: { include: { _count: { select: { results: true } } } },
      },
      orderBy: { resultSheet: { examDate: 'asc' } as any },
    });

    return rows.map((r) => ({
      sheetId: r.resultSheetId,
      title: r.resultSheet.title,
      year: r.resultSheet.year,
      examDate: (r.resultSheet as any).examDate ?? '',
      description: (r.resultSheet as any).description ?? undefined,
      gradeRanges: r.resultSheet.gradeRanges,
      mark: r.mark,
      grade: r.grade,
      note: r.note ?? '',
      totalStudents: r.resultSheet._count.results,
    }));
  }

  async findExamClassDetail(sheetId: string, studentId: string) {
    const sheet = await this.prisma.resultSheet.findUnique({
      where: { id: sheetId },
      include: { results: true },
    });
    if (!sheet) throw new NotFoundException('Result sheet not found');

    const myResult = sheet.results.find((r) => r.studentId === studentId);
    const sortedByMark = [...sheet.results]
      .filter((r) => r.mark !== null)
      .sort((a, b) => (b.mark ?? 0) - (a.mark ?? 0));

    const myMark = myResult?.mark ?? null;
    const myRank =
      myMark !== null
        ? sortedByMark.findIndex((r) => r.studentId === studentId) + 1
        : null;

    return {
      sheetId: sheet.id,
      title: sheet.title,
      year: sheet.year,
      examDate: (sheet as any).examDate ?? '',
      gradeRanges: sheet.gradeRanges,
      studentMark: myMark,
      studentGrade: myResult?.grade ?? null,
      studentNote: myResult?.note ?? '',
      studentRank: myRank,
      totalStudents: sheet.results.length,
      totalMarked: sortedByMark.length,
      allMarks: [...sheet.results]
        .sort((a, b) => (b.mark ?? -1) - (a.mark ?? -1))
        .map((r) => ({
          mark: r.mark,
          grade: r.grade,
          isCurrentStudent: r.studentId === studentId,
        })),
    };
  }

  async loadStudents(institutionIds: string[], year: string) {
    const includeOnline = institutionIds.includes('online');
    const institutionFilter = institutionIds.filter((i) => i !== 'online');

    const orConditions: any[] = [];
    if (institutionFilter.length > 0) {
      orConditions.push({ institutionId: { in: institutionFilter } });
    }
    if (includeOnline) {
      orConditions.push({ institutionId: null });
    }

    const students = await this.prisma.student.findMany({
      where: {
        examYear: year,
        status: 'ACTIVE',
        ...(orConditions.length > 0 ? { OR: orConditions } : {}),
      },
      select: RESULT_STUDENT_SELECT,
      orderBy: { studentNumber: 'asc' },
    });

    return students.map((s) => ({
      studentId: s.id,
      studentNumber: s.studentNumber,
      studentName: s.name,
      subject: s.subject,
      mark: null,
      grade: '',
      note: '',
    }));
  }
}
