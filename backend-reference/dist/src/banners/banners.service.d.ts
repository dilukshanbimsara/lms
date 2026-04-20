import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
export declare class BannersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }[]>;
    findActive(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }>;
    create(dto: CreateBannerDto): import(".prisma/client").Prisma.Prisma__BannerClient<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateBannerDto): Promise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }>;
}
