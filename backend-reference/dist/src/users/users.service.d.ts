import { PrismaService } from '../prisma/prisma.service';
export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    imageUrl?: string;
    role?: 'SUPER_ADMIN' | 'TEACHER';
}
export interface UpdateUserDto {
    name?: string;
    phone?: string;
    imageUrl?: string;
    password?: string;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        phone: string | null;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        phone: string | null;
        imageUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
