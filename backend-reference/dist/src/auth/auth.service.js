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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.id, email: user.email, role: user.role, type: 'admin' };
        return {
            access_token: this.jwt.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async studentLogin(email, password) {
        const student = await this.prisma.student.findUnique({ where: { email } });
        if (!student || !(await bcrypt.compare(password, student.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (student.status === 'PENDING') {
            throw new common_1.ForbiddenException('Registration is pending approval');
        }
        if (student.status === 'REJECTED') {
            throw new common_1.ForbiddenException('Registration was rejected');
        }
        if (student.status === 'DISABLED') {
            throw new common_1.ForbiddenException('Account has been disabled');
        }
        const payload = {
            sub: student.id,
            email: student.email,
            role: 'STUDENT',
            type: 'student',
        };
        return {
            access_token: this.jwt.sign(payload),
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                studentNumber: student.studentNumber,
                status: student.status,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map