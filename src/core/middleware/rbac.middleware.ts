import { UnauthorizedError } from '../errors/custom-errors';

export function checkRole(userRoles: string[], requiredRole: string) {
    if (!userRoles.includes(requiredRole)) {
        throw new UnauthorizedError(`Role ${requiredRole} is required`);
    }
}
