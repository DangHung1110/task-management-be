import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../exceptions";

export const checkIsOwnerOrAdmin = (paramName: string = "id") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const resourceId = req.params[paramName];

            if (!user) {
                throw new ForbiddenException("User not authenticated");
            }

            // Check admin FIRST - admin bypasses all checks
            const isAdmin = user.roles?.includes("admin");
            if (isAdmin) {
                return next();
            }

            // Then check if user is owner of the resource
            if (user.id === resourceId) {
                return next();
            }

            throw new ForbiddenException("You don't have permission to access this resource");
        } catch (error) {
            next(error);
        }
    };
};
