import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from './roles.enum';

interface JwtPayload {
  sub: string;   // user.id
  email: string;
  role: Role;
}

/**
 * JwtStrategy — validates the Bearer token from the Authorization header.
 * The validated payload is attached to req.user by Passport.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Returned object becomes req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
