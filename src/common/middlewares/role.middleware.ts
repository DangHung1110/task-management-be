import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";

export const requireRole = (...roles: string[]) => {
    // Validate input - đảm bảo có ít nhất 1 role hợp lệ
    if (!roles || roles.length === 0) {
        throw new Error("requireRole middleware requires at least one role");
    }
    
    if (roles.some(role => !role || typeof role !== 'string' || role.trim() === "")) {
        throw new Error("requireRole middleware requires valid role names");
    }

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
    // Validate input
    if (!roles || roles.length === 0) {
        throw new Error("requireAllRoles middleware requires at least one role");
    }
    
    if (roles.some(role => !role || typeof role !== 'string' || role.trim() === "")) {
        throw new Error("requireAllRoles middleware requires valid role names");
    }

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

// Only export requireAdmin - remove confusing aliases
export const requireAdmin = requireRole("admin");