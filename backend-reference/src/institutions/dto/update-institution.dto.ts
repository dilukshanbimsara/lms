import { IsString, IsUrl, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { TimetableRowDto } from './create-institution.dto';

export class UpdateInstitutionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  mapUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimetableRowDto)
  @IsOptional()
  timetable?: TimetableRowDto[];
}
