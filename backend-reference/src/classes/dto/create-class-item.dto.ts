import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateClassItemDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  fee: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  seats?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
