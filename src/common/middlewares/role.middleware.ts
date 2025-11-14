import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.roles || user.roles.length === 0) {
                throw new ForbiddenException("No roles assigned to user");
            }

            const hasRole = roles.some(role => user.roles.includes(role));

            if (!hasRole) {
                throw new ForbiddenException(
                    `Access denied: Require one of roles [${roles.join(", ")}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


export const requireAllRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.roles || user.roles.length === 0) {
                throw new ForbiddenException("No roles assigned to user");
            }

            const hasAllRoles = roles.every(role => user.roles.includes(role));

            if (!hasAllRoles) {
                const missingRoles = roles.filter(role => !user.roles.includes(role));
                throw new ForbiddenException(
                    `Access denied: Missing roles [${missingRoles.join(", ")}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


export const requireAdmin = requireRole("admin");
export const checkRole = requireRole;
export const checkAuth = requireAdmin;