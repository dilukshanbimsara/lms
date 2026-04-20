import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.institution.findMany({
      include: { timetable: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: { timetable: true },
    });
    if (!institution) throw new NotFoundException(`Institution ${id} not found`);
    return institution;
  }

  create(dto: CreateInstitutionDto) {
    const { timetable, ...rest } = dto;
    return this.prisma.institution.create({
      data: {
        ...rest,
        timetable: timetable
          ? { create: timetable }
          : undefined,
      },
      include: { timetable: true },
    });
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);
    const { timetable, ...rest } = dto;

    // Replace timetable rows: delete existing, create new ones
    return this.prisma.institution.update({
      where: { id },
      data: {
        ...rest,
        timetable: timetable
          ? {
              deleteMany: {},
              create: timetable,
            }
          : undefined,
      },
      include: { timetable: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.institution.delete({ where: { id } });
  }
}
