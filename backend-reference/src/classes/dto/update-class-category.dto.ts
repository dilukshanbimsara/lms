import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsOptional, IsInt, Min,
  IsArray, ValidateNested,
} from 'class-validator';
import { CreateClassItemDto } from './create-class-item.dto';

export class UpdateClassCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClassItemDto)
  @IsOptional()
  items?: CreateClassItemDto[];
}
