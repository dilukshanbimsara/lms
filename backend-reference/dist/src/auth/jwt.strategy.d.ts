import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from './roles.enum';
interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: Role;
    }>;
}
export {};
