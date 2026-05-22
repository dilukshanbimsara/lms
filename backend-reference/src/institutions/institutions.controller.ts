import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  findAll() { return this.institutionsService.findAll(); }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string) { return this.institutionsService.findOne(id); }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateInstitutionDto) { return this.institutionsService.create(dto); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) { return this.institutionsService.remove(id); }
}
