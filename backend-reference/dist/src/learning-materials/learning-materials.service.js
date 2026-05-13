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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningMaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LearningMaterialsService = class LearningMaterialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllPublic() {
        return this.prisma.learningMaterial.findMany({
            select: {
                id: true,
                title: true,
                type: true,
                subject: true,
                level: true,
                fileUrl: true,
                content: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    findAll() {
        return this.prisma.learningMaterial.findMany({
            include: { uploader: { select: { id: true, name: true, email: true } } },
            orderBy: { title: 'asc' },
        });
    }
    findByUploader(uploaderId) {
        return this.prisma.learningMaterial.findMany({
            where: { uploaderId },
            include: { uploader: { select: { id: true, name: true, email: true } } },
            orderBy: { title: 'asc' },
        });
    }
    async findOne(id) {
        const material = await this.prisma.learningMaterial.findUnique({
            where: { id },
            include: { uploader: { select: { id: true, name: true, email: true } } },
        });
        if (!material)
            throw new common_1.NotFoundException(`Material ${id} not found`);
        return material;
    }
    create(dto) {
        const { uploaderId, content = '', ...rest } = dto;
        return this.prisma.learningMaterial.create({
            data: {
                ...rest,
                content,
                uploader: { connect: { id: uploaderId } },
            },
            include: { uploader: { select: { id: true, name: true, email: true } } },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.learningMaterial.update({
            where: { id },
            data: dto,
            include: { uploader: { select: { id: true, name: true, email: true } } },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.learningMaterial.delete({ where: { id } });
    }
};
exports.LearningMaterialsService = LearningMaterialsService;
exports.LearningMaterialsService = LearningMaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearningMaterialsService);
//# sourceMappingURL=learning-materials.service.js.map