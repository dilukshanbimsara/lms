import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

// Metadata key used by RolesGuard to look up allowed roles.
export const ROLES_KEY = 'roles';

/**
 * @Roles(Role.SUPER_ADMIN)
 * Attach to a controller method (or the whole controller) to restrict access.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
