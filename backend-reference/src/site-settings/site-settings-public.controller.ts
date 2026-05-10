import { Controller, Get, Param } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

/**
 * Public endpoint — no auth required, read-only.
 * Used by Next.js server components to read site settings
 * (about content, theme, nav) via the reliable NestJS Prisma connection.
 */
@Controller('site-settings-public')
export class SiteSettingsPublicController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  @Get(':key')
  async findOne(@Param('key') key: string) {
    try {
      return await this.settingsService.findOne(key);
    } catch {
      return null;
    }
  }
}
