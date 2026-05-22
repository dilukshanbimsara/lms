import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, type: 'admin' };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async studentLogin(email: string, password: string) {
    const student = await this.prisma.student.findUnique({ where: { email } });

    if (!student || !(await bcrypt.compare(password, student.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (student.status === 'PENDING') {
      throw new ForbiddenException('Registration is pending approval');
    }

    if (student.status === 'REJECTED') {
      throw new ForbiddenException('Registration was rejected');
    }

    if (student.status === 'DISABLED') {
      throw new ForbiddenException('Account has been disabled');
    }

    const payload = {
      sub: student.id,
      email: student.email,
      role: 'STUDENT',
      type: 'student',
    };
    return {
      access_token: this.jwt.sign(payload),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentNumber: student.studentNumber,
        status: student.status,
      },
    };
  }
}
