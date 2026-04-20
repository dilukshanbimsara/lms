import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { MaterialType } from './create-material.dto';

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;
}
