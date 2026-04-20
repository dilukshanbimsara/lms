import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
export declare class InstitutionsController {
    private readonly institutionsService;
    constructor(institutionsService: InstitutionsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        timetable: {
            id: string;
            day: string;
            time: string;
            subject: string;
            level: string;
            institutionId: string;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        mapUrl: string | null;
    })[]>;
    findOne(id: string): Promise<{
        timetable: {
            id: string;
            day: string;
            time: string;
            subject: string;
            level: string;
            institutionId: string;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        mapUrl: string | null;
    }>;
    create(dto: CreateInstitutionDto): import(".prisma/client").Prisma.Prisma__InstitutionClient<{
        timetable: {
            id: string;
            day: string;
            time: string;
            subject: string;
            level: string;
            institutionId: string;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        mapUrl: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateInstitutionDto): Promise<{
        timetable: {
            id: string;
            day: string;
            time: string;
            subject: string;
            level: string;
            institutionId: string;
        }[];
    } & {
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        mapUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        mapUrl: string | null;
    }>;
}
