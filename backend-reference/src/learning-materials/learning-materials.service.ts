import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class LearningMaterialsService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.learningMaterial.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        subject: true,
        level: true,
        fileUrl: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.learningMaterial.findMany({
      include: { uploader: { select: { id: true, name: true, email: true } } },
      orderBy: { title: 'asc' },
    });
  }

  findByUploader(uploaderId: string) {
    return this.prisma.learningMaterial.findMany({
      where: { uploaderId },
      include: { uploader: { select: { id: true, name: true, email: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.learningMaterial.findUnique({
      where: { id },
      include: { uploader: { select: { id: true, name: true, email: true } } },
    });
    if (!material) throw new NotFoundException(`Material ${id} not found`);
    return material;
  }

  create(dto: CreateMaterialDto) {
    const { uploaderId, content = '', ...rest } = dto;
    return this.prisma.learningMaterial.create({
      data: {
        ...rest,
        content,
        uploader: { connect: { id: uploaderId } },
      },
      include: { uploader: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, dto: UpdateMaterialDto) {
    await this.findOne(id);
    return this.prisma.learningMaterial.update({
      where: { id },
      data: dto,
      include: { uploader: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.learningMaterial.delete({ where: { id } });
  }
}
