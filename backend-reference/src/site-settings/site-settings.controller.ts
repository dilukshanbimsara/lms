import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { SiteSettingsService } from './site-settings.service';

/**
 * SiteSettingsController — SUPER_ADMIN only.
 *
 * Settings are keyed records (e.g. "primaryHSL", "navItems").
 * GET /site-settings         — returns all settings
 * GET /site-settings/:key    — returns a specific setting value
 * PUT /site-settings/:key    — upserts a setting (JSON body: { value: ... })
 */
@Controller('site-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SiteSettingsController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: { value: unknown }) {
    return this.settingsService.upsert(key, body.value);
  }
}
