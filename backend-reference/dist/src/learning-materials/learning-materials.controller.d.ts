import { Role } from '../auth/roles.enum';
import { LearningMaterialsService } from './learning-materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class LearningMaterialsController {
    private readonly materialsService;
    constructor(materialsService: LearningMaterialsService);
    findAll(req: Express.Request & {
        user: {
            id: string;
            role: Role;
        };
    }): import(".prisma/client").Prisma.PrismaPromise<({
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        title: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    })[]>;
    findOne(id: string, req: Express.Request & {
        user: {
            id: string;
            role: Role;
        };
    }): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        title: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
    create(dto: CreateMaterialDto, req: Express.Request & {
        user: {
            id: string;
        };
    }): import(".prisma/client").Prisma.Prisma__LearningMaterialClient<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        title: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateMaterialDto, req: Express.Request & {
        user: {
            id: string;
            role: Role;
        };
    }): Promise<{
        uploader: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        title: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
    remove(id: string, req: Express.Request & {
        user: {
            id: string;
            role: Role;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        title: string;
        level: string;
        type: import(".prisma/client").$Enums.MaterialType;
        content: string;
        fileUrl: string | null;
        uploaderId: string;
    }>;
}
