import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { ResultsService } from './results.service';

@Controller('student-results')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  getMyResults(@Request() req: { user: { id: string } }) {
    return this.resultsService.findMyResults(req.user.id);
  }

  @Get(':id')
  getExamDetail(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.resultsService.findExamClassDetail(id, req.user.id);
  }
}
