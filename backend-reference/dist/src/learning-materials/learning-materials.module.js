"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningMaterialsModule = void 0;
const common_1 = require("@nestjs/common");
const learning_materials_service_1 = require("./learning-materials.service");
const learning_materials_controller_1 = require("./learning-materials.controller");
const learning_materials_public_controller_1 = require("./learning-materials-public.controller");
let LearningMaterialsModule = class LearningMaterialsModule {
};
exports.LearningMaterialsModule = LearningMaterialsModule;
exports.LearningMaterialsModule = LearningMaterialsModule = __decorate([
    (0, common_1.Module)({
        controllers: [learning_materials_controller_1.LearningMaterialsController, learning_materials_public_controller_1.LearningMaterialsPublicController],
        providers: [learning_materials_service_1.LearningMaterialsService],
    })
], LearningMaterialsModule);
//# sourceMappingURL=learning-materials.module.js.map