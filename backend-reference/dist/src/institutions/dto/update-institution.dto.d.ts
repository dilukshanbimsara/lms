import { TimetableRowDto } from './create-institution.dto';
export declare class UpdateInstitutionDto {
    name?: string;
    address?: string;
    phone?: string;
    mapUrl?: string;
    timetable?: TimetableRowDto[];
}
