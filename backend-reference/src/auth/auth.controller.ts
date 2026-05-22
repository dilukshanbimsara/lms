import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login — admin/teacher login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /api/auth/student-login — student login
  @Post('student-login')
  @HttpCode(HttpStatus.OK)
  studentLogin(@Body() dto: LoginDto) {
    return this.authService.studentLogin(dto.email, dto.password);
  }
}
