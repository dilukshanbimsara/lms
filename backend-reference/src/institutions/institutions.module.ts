import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsPublicController } from './institutions-public.controller';

@Module({
  controllers: [InstitutionsController, InstitutionsPublicController],
  providers: [InstitutionsService],
})
export class InstitutionsModule {}
