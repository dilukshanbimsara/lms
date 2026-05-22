import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
export declare class InstitutionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        timetable: {
            id: string;
            subject: string;
            institutionId: string;
            day: string;
            time: string;
            level: string;
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
            subject: string;
            institutionId: string;
            day: string;
            time: string;
            level: string;
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
            subject: string;
            institutionId: string;
            day: string;
            time: string;
            level: string;
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
            subject: string;
            institutionId: string;
            day: string;
            time: string;
            level: string;
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
