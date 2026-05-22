"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const banners_module_1 = require("./banners/banners.module");
const institutions_module_1 = require("./institutions/institutions.module");
const learning_materials_module_1 = require("./learning-materials/learning-materials.module");
const site_settings_module_1 = require("./site-settings/site-settings.module");
const users_module_1 = require("./users/users.module");
const classes_module_1 = require("./classes/classes.module");
const students_module_1 = require("./students/students.module");
const results_module_1 = require("./results/results.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            banners_module_1.BannersModule,
            institutions_module_1.InstitutionsModule,
            learning_materials_module_1.LearningMaterialsModule,
            site_settings_module_1.SiteSettingsModule,
            classes_module_1.ClassesModule,
            students_module_1.StudentsModule,
            results_module_1.ResultsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map