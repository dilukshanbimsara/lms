import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsOptional, IsInt, Min,
  IsArray, ValidateNested,
} from 'class-validator';
import { CreateClassItemDto } from './create-class-item.dto';

export class CreateClassCategoryDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
