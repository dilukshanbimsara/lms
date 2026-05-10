import { Module } from '@nestjs/common';
import { LearningMaterialsService } from './learning-materials.service';
import { LearningMaterialsController } from './learning-materials.controller';
import { LearningMaterialsPublicController } from './learning-materials-public.controller';

@Module({
  controllers: [LearningMaterialsController, LearningMaterialsPublicController],
  providers: [LearningMaterialsService],
})
export class LearningMaterialsModule {}
