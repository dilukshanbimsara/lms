import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentProfileDto } from './dto/update-student-status.dto';

const STUDENT_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  examYear: true,
  examLevel: true,
  subject: true,
  subjectCode: true,
  institutionId: true,
  studentNumber: true,
  status: true,
  profileImageUrl: true,
  classItemId: true,
  createdAt: true,
  updatedAt: true,
  institution: { select: { id: true, name: true } },
};

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private async generateStudentNumber(
    examYear: string,
    subjectCode: string,
  ): Promise<string> {
    const count = await this.prisma.student.count({
      where: { examYear, subjectCode },
    });
    const seq = String(count + 1).padStart(5, '0');
    return `STU${examYear}${subjectCode.toUpperCase()}${seq}`;
  }

  async register(dto: CreateStudentDto) {
    const existing = await this.prisma.student.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    if (dto.institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: dto.institutionId },
      });
      if (!institution) {
        throw new BadRequestException('Institution not found');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const studentNumber = await this.generateStudentNumber(
      dto.examYear,
      dto.subjectCode,
    );

    const student = await this.prisma.student.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        examYear: dto.examYear,
        examLevel: dto.examLevel,
        subject: dto.subject,
        subjectCode: dto.subjectCode.toUpperCase(),
        institutionId: dto.institutionId ?? null,
        classItemId: dto.classItemId ?? null,
        studentNumber,
      },
      select: STUDENT_SELECT,
    });

    return student;
  }

  async findAll(params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    examYear?: string;
    examLevel?: string;
  }) {
    const { status, page = 1, limit = 50, search, examYear, examLevel } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (examYear) where.examYear = examYear;
    if (examLevel) where.examLevel = examLevel;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: STUDENT_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: STUDENT_SELECT,
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByEmail(email: string) {
    return this.prisma.student.findUnique({ where: { email } });
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: STUDENT_SELECT,
    });
  }

  async reject(id: string) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: STUDENT_SELECT,
    });
  }

  async toggleStatus(id: string) {
    const student = await this.findOne(id);
    const newStatus = student.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    return this.prisma.student.update({
      where: { id },
      data: { status: newStatus },
      select: STUDENT_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
  }

  async updateProfile(id: string, dto: UpdateStudentProfileDto) {
    return this.prisma.student.update({
      where: { id },
      data: dto,
      select: STUDENT_SELECT,
    });
  }
}
