import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsObject,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentMarkDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsNumber()
  mark?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateResultSheetDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  year: string;

  @IsString()
  @IsNotEmpty()
  examDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  gradeRanges: Record<string, { min: number; max: number }>;

  @IsArray()
  @IsString({ each: true })
  institutionIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentMarkDto)
  results: StudentMarkDto[];
}
