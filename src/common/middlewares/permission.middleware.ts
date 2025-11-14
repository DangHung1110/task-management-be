import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { Permission } from "../../entities/Role";
import { In } from "typeorm";

export const requirePermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!user.roles || user.roles.length === 0) {
                throw new ForbiddenException("No roles assigned to user");
            }

            // Sử dụng permissions đã load sẵn từ authenticate middleware (nếu có)
            if (user.permissions && user.permissions.length > 0) {
                if (user.permissions.includes(permissionName)) {
                    return next();
                }
            }

            // Nếu không có permissions trong req.user, query từ database
            const permissionRepo = AppDataSource.getRepository(Permission);
            const hasPermission = await permissionRepo.findOne({
                where: {
                    permissionName,
                    role: { name: In(user.roles) }
                },
                relations: ["role"]
            });

            if (!hasPermission) {
                throw new ForbiddenException(`Access denied: Missing permission [${permissionName}]`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};



