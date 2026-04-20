import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { LearningMaterialsService } from './learning-materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

/**
 * LearningMaterialsController
 *
 * - SUPER_ADMIN: full access (GET all, GET any, PATCH any, DELETE any)
 * - TEACHER:     GET their own, POST (auto-assigns uploaderId), PATCH their own
 */
@Controller('learning-materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningMaterialsController {
  constructor(private readonly materialsService: LearningMaterialsService) {}

  // GET /learning-materials — SUPER_ADMIN gets all; TEACHER gets their own
  @Get()
  findAll(@Request() req: Express.Request & { user: { id: string; role: Role } }) {
    if (req.user.role === Role.SUPER_ADMIN) {
      return this.materialsService.findAll();
    }
    return this.materialsService.findByUploader(req.user.id);
  }

  // GET /learning-materials/:id
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: { id: string; role: Role } },
  ) {
    const material = await this.materialsService.findOne(id);
    if (
      req.user.role === Role.TEACHER &&
      material.uploaderId !== req.user.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    return material;
  }

  // POST /learning-materials — TEACHER only (SUPER_ADMIN manages via findAll)
  @Post()
  @Roles(Role.TEACHER, Role.SUPER_ADMIN)
  create(
    @Body() dto: CreateMaterialDto,
    @Request() req: Express.Request & { user: { id: string } },
  ) {
    return this.materialsService.create({ ...dto, uploaderId: req.user.id });
  }

  // PATCH /learning-materials/:id — own record only for TEACHER
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @Request() req: Express.Request & { user: { id: string; role: Role } },
  ) {
    const material = await this.materialsService.findOne(id);
    if (
      req.user.role === Role.TEACHER &&
      material.uploaderId !== req.user.id
    ) {
      throw new ForbiddenException('Cannot edit another teacher\'s material');
    }
    return this.materialsService.update(id, dto);
  }

  // DELETE /learning-materials/:id — SUPER_ADMIN or the owning TEACHER
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.TEACHER)
  async remove(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: { id: string; role: Role } },
  ) {
    const material = await this.materialsService.findOne(id);
    if (
      req.user.role === Role.TEACHER &&
      material.uploaderId !== req.user.id
    ) {
      throw new ForbiddenException("Cannot delete another teacher's material");
    }
    return this.materialsService.remove(id);
  }
}
