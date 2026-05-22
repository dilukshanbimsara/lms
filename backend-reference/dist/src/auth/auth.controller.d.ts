import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    studentLogin(dto: LoginDto): Promise<{
        access_token: string;
        student: {
            id: string;
            name: string;
            email: string;
            studentNumber: string;
            status: "ACTIVE";
        };
    }>;
}
