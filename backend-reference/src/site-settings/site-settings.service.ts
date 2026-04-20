import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteSettingsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findOne(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  upsert(key: string, value: unknown) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
  }
}
