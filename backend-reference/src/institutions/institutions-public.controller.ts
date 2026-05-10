import { Controller, Get } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';

/**
 * Public endpoint — no auth required.
 * Returns all institutions with their timetable rows.
 * Used by the public-facing Institutions page.
 */
@Controller('institutions-public')
export class InstitutionsPublicController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  findAll() {
    return this.institutionsService.findAll();
  }
}
