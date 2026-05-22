import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResultsController } from './results.controller';
import { StudentResultsController } from './student-results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResultsController, StudentResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
