export declare class TimetableRowDto {
    day: string;
    time: string;
    subject: string;
    level: string;
}
export declare class CreateInstitutionDto {
    name: string;
    address: string;
    phone: string;
    mapUrl?: string;
    timetable?: TimetableRowDto[];
}
