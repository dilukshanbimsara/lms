"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningMaterialsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
const learning_materials_service_1 = require("./learning-materials.service");
const create_material_dto_1 = require("./dto/create-material.dto");
const update_material_dto_1 = require("./dto/update-material.dto");
let LearningMaterialsController = class LearningMaterialsController {
    constructor(materialsService) {
        this.materialsService = materialsService;
    }
    findAll(req) {
        if (req.user.role === roles_enum_1.Role.SUPER_ADMIN) {
            return this.materialsService.findAll();
        }
        return this.materialsService.findByUploader(req.user.id);
    }
    async findOne(id, req) {
        const material = await this.materialsService.findOne(id);
        if (req.user.role === roles_enum_1.Role.TEACHER &&
            material.uploaderId !== req.user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return material;
    }
    create(dto, req) {
        return this.materialsService.create({ ...dto, uploaderId: req.user.id });
    }
    async update(id, dto, req) {
        const material = await this.materialsService.findOne(id);
        if (req.user.role === roles_enum_1.Role.TEACHER &&
            material.uploaderId !== req.user.id) {
            throw new common_1.ForbiddenException('Cannot edit another teacher\'s material');
        }
        return this.materialsService.update(id, dto);
    }
    async remove(id, req) {
        const material = await this.materialsService.findOne(id);
        if (req.user.role === roles_enum_1.Role.TEACHER &&
            material.uploaderId !== req.user.id) {
            throw new common_1.ForbiddenException("Cannot delete another teacher's material");
        }
        return this.materialsService.remove(id);
    }
};
exports.LearningMaterialsController = LearningMaterialsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LearningMaterialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningMaterialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.TEACHER, roles_enum_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_material_dto_1.CreateMaterialDto, Object]),
    __metadata("design:returntype", void 0)
], LearningMaterialsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_material_dto_1.UpdateMaterialDto, Object]),
    __metadata("design:returntype", Promise)
], LearningMaterialsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUPER_ADMIN, roles_enum_1.Role.TEACHER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LearningMaterialsController.prototype, "remove", null);
exports.LearningMaterialsController = LearningMaterialsController = __decorate([
    (0, common_1.Controller)('learning-materials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [learning_materials_service_1.LearningMaterialsService])
], LearningMaterialsController);
//# sourceMappingURL=learning-materials.controller.js.map