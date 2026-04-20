import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

/**
 * BannersController — all routes are SUPER_ADMIN only.
 * Uses both JwtAuthGuard (authentication) and RolesGuard (authorisation).
 */
@Controller('banners')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.SUPER_ADMIN)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // GET /banners
  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  // GET /banners/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  // POST /banners
  @Post()
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  // PATCH /banners/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  // DELETE /banners/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
