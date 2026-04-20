import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  imageUrl?: string;
  role?: 'SUPER_ADMIN' | 'TEACHER';
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  imageUrl?: string;
  password?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, imageUrl: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, phone: true, imageUrl: true, role: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException(`Email ${dto.email} is already in use`);

    // Enforce one teacher and one super admin site-wide
    const role = dto.role ?? 'TEACHER';
    const count = await this.prisma.user.count({ where: { role } });
    if (role === 'TEACHER' && count >= 1) {
      throw new ConflictException('A teacher account already exists. Only one teacher is allowed.');
    }
    if (role === 'SUPER_ADMIN' && count >= 1) {
      throw new ConflictException('A super admin account already exists. Only one super admin is allowed.');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, name: true, phone: true, imageUrl: true, role: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: Partial<UpdateUserDto> = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, phone: true, imageUrl: true, role: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
