import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";


export const requirePermission = (resource: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.permissions || user.permissions.length === 0) {
                throw new ForbiddenException("No permissions assigned to user");
            }

            const requiredPermission = `${resource}:${action}`;
            const hasPermission = user.permissions.includes(requiredPermission);

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied: Missing permission [${requiredPermission}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


export const requireAnyPermission = (...permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.permissions || user.permissions.length === 0) {
                throw new ForbiddenException("No permissions assigned to user");
            }

            const hasPermission = permissions.some(p => 
                user.permissions?.includes(p)
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied: Require one of permissions [${permissions.join(", ")}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


export const requireAllPermissions = (...permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.permissions || user.permissions.length === 0) {
                throw new ForbiddenException("No permissions assigned to user");
            }

            const hasAllPermissions = permissions.every(p => 
                user.permissions?.includes(p)
            );

            if (!hasAllPermissions) {
                const missingPermissions = permissions.filter(p => 
                    !user.permissions?.includes(p)
                );
                
                throw new ForbiddenException(
                    `Access denied: Missing permissions [${missingPermissions.join(", ")}]`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};