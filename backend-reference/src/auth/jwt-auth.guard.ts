import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Wraps passport-jwt strategy — use with @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
