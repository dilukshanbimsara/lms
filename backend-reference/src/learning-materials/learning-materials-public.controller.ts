import { Controller, Get } from '@nestjs/common';
import { LearningMaterialsService } from './learning-materials.service';

/**
 * Public endpoint — no auth required.
 * Returns all learning materials that have a file attached.
 * Used by the public-facing Learning Centre page.
 */
@Controller('learning-materials-public')
export class LearningMaterialsPublicController {
  constructor(private readonly materialsService: LearningMaterialsService) {}

  @Get()
  findPublic() {
    return this.materialsService.findAllPublic();
  }
}
