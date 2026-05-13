import { CreateClassItemDto } from './create-class-item.dto';

export class UpdateClassCategoryDto {
  label?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  items?: CreateClassItemDto[];
}
