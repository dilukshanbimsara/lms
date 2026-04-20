import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getProfile(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        imageUrl: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateMe(req: {
        user: {
            id: string;
        };
    }, dto: UpdateUserDto): Promise<{
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
