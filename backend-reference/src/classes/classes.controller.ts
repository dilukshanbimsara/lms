import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ClassesService } from './classes.service';
import { CreateClassCategoryDto } from './dto/create-class-category.dto';
import { UpdateClassCategoryDto } from './dto/update-class-category.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.TEACHER)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll() { return this.classesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.classesService.findOne(id); }

  @Post()
  create(@Body() dto: CreateClassCategoryDto) { return this.classesService.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassCategoryDto) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.classesService.remove(id); }
}
