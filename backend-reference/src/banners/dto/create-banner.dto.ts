import { IsString, IsUrl, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsUrl()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
