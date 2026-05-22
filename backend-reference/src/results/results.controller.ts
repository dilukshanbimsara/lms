import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { CreateResultSheetDto } from './dto/create-result-sheet.dto';
import { ResultsService } from './results.service';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.TEACHER)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  // GET /results/students?institutionIds=id1,id2&year=2027
  // Must be declared before /:id to avoid route conflict
  @Get('students')
  loadStudents(
    @Query('institutionIds') institutionIds: string,
    @Query('year') year: string,
  ) {
    const ids = institutionIds ? institutionIds.split(',').filter(Boolean) : [];
    return this.resultsService.loadStudents(ids, year);
  }

  @Get()
  findAll() {
    return this.resultsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateResultSheetDto) {
    console.log('Received DTO for creating result sheet:', dto);
    return this.resultsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateResultSheetDto) {
    return this.resultsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resultsService.remove(id);
  }
}
