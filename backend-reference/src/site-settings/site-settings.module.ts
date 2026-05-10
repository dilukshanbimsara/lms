import { Module } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingsController } from './site-settings.controller';
import { SiteSettingsPublicController } from './site-settings-public.controller';

@Module({
  controllers: [SiteSettingsController, SiteSettingsPublicController],
  providers: [SiteSettingsService],
})
export class SiteSettingsModule {}
