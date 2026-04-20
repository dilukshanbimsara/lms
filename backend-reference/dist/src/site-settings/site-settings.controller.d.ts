import { SiteSettingsService } from './site-settings.service';
export declare class SiteSettingsController {
    private readonly settingsService;
    constructor(settingsService: SiteSettingsService);
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
    upsert(key: string, body: {
        value: unknown;
    }): import(".prisma/client").Prisma.Prisma__SiteSettingClient<{
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
