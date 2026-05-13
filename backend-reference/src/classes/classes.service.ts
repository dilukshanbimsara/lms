import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassCategoryDto } from './dto/create-class-category.dto';
import { UpdateClassCategoryDto } from './dto/update-class-category.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.classCategory.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.classCategory.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!category) throw new NotFoundException(`Class category ${id} not found`);
    return category;
  }

  create(dto: CreateClassCategoryDto) {
    const { items, ...rest } = dto;
    return this.prisma.classCategory.create({
      data: {
        ...rest,
        icon: rest.icon ?? 'BookOpen',
        items: items ? { create: items } : undefined,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdateClassCategoryDto) {
    await this.findOne(id);
    const { items, ...rest } = dto;
    return this.prisma.classCategory.update({
      where: { id },
      data: {
        ...rest,
        items: items
          ? { deleteMany: {}, create: items }
          : undefined,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.classCategory.delete({ where: { id } });
  }
}
