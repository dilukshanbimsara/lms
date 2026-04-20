import { BannersService } from './banners.service';
export declare class BannersPublicController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    findActive(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        isActive: boolean;
        sortOrder: number;
    }[]>;
}
