import { IsString, IsUrl, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class TimetableRowDto {
  @IsString()
  day: string;

  @IsString()
  time: string;

  @IsString()
  subject: string;

  @IsString()
  level: string;
}

export class CreateInstitutionDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsUrl()
  @IsOptional()
  mapUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimetableRowDto)
  @IsOptional()
  timetable?: TimetableRowDto[];
}
