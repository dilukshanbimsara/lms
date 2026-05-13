import { CreateClassItemDto } from './create-class-item.dto';

export class CreateClassCategoryDto {
  label: string;
  icon?: string;
  description: string;
  sortOrder?: number;
  items?: CreateClassItemDto[];
}
