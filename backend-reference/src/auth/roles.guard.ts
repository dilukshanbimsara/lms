import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

/**
 * RolesGuard — checks the authenticated user's role against the
 * @Roles() decorator on the route handler or controller class.
 *
 * Must be used together with JwtAuthGuard so req.user is populated.
 * Register globally in AppModule or per-controller with @UseGuards.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Collect allowed roles from method and class metadata (method wins)
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → route is role-agnostic (still needs JWT)
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    return required.includes(user?.role);
  }
}
