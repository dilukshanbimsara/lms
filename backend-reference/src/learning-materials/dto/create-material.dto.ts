import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';

export enum MaterialType {
  PDF = 'PDF',
  NOTE = 'NOTE',
  VIDEO = 'VIDEO',
}

export class CreateMaterialDto {
  @IsString()
  title: string;

  @IsEnum(MaterialType)
  type: MaterialType;

  @IsString()
  subject: string;

  @IsString()
  level: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  // Injected by the controller from req.user.id — not from request body
  uploaderId?: string;
}
