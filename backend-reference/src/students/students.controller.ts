import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentProfileDto } from './dto/update-student-status.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // POST /students/register — public
  @Post('register')
  register(@Body() dto: CreateStudentDto) {
    return this.studentsService.register(dto);
  }

  // GET /students/me — authenticated student only
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getMe(@Request() req: { user: { id: string } }) {
    return this.studentsService.findOne(req.user.id);
  }

  // PATCH /students/me/profile — authenticated student only
  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.updateProfile(req.user.id, dto);
  }

  // GET /students — admin or teacher
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('examYear') examYear?: string,
    @Query('examLevel') examLevel?: string,
  ) {
    return this.studentsService.findAll({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      search,
      examYear,
      examLevel,
    });
  }

  // GET /students/:id — admin or teacher
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  // PATCH /students/:id/approve — admin or teacher
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  approve(@Param('id') id: string) {
    return this.studentsService.approve(id);
  }

  // PATCH /students/:id/reject — admin or teacher
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  reject(@Param('id') id: string) {
    return this.studentsService.reject(id);
  }

  // PATCH /students/:id/toggle-status — admin or teacher
  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  toggleStatus(@Param('id') id: string) {
    return this.studentsService.toggleStatus(id);
  }

  // DELETE /students/:id — admin or teacher
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
