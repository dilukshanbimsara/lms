import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class LearningMaterialsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    })[]>;
    findByUploader(uploaderId: string): import(".prisma/client").Prisma.PrismaPromise<({
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    })[]>;
    findOne(id: string): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
    create(dto: CreateMaterialDto): import(".prisma/client").Prisma.Prisma__LearningMaterialClient<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateMaterialDto): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        subject: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
}
