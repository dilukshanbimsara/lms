import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { LearningMaterialsModule } from './learning-materials/learning-materials.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Load .env file globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Prisma database client (available everywhere)
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    BannersModule,
    InstitutionsModule,
    LearningMaterialsModule,
    SiteSettingsModule,
  ],
})
export class AppModule {}
