import { Controller, Get } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes-public')
export class ClassesPublicController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll() { return this.classesService.findAll(); }
}
