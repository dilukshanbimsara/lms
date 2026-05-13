export class CreateClassItemDto {
  subject: string;
  level: string;
  day: string;
  time: string;
  fee: string;
  venue?: string;
  seats?: number;
  notes?: string;
  sortOrder?: number;
}
