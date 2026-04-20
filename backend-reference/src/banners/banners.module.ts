import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { BannersPublicController } from './banners-public.controller';

@Module({
  controllers: [BannersController, BannersPublicController],
  providers: [BannersService],
})
export class BannersModule {}
