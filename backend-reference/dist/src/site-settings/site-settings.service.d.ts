import { PrismaService } from '../prisma/prisma.service';
export declare class SiteSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(key: string): Promise<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }>;
    upsert(key: string, value: unknown): import(".prisma/client").Prisma.Prisma__SiteSettingClient<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
