import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { User } from "../../entities/User/user";
import { AuthUtils } from "../utils/auth.utils";
import dotenv from "dotenv";
import { string } from "zod";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: User & {
        roles: string[];
        permissions: string[];
    };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Access token is required");
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET_KEY;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET_KEY is not configured");
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
        
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: decoded.userId }
        });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        if (!user.isVerified) {
            throw new UnauthorizedException("User not verified");
        }

        const { roles, permissions } = await AuthUtils.getUserRolesAndPermissions(user.id);

        req.user = {
            ...user,
            roles,
            permissions
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedException("Invalid token"));
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedException("Token expired"));
            return;
        }
        next(error);
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Access token is required");
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET_KEY;

        if (!jwtSecret) {
            throw new Error("JWT_SECRET_KEY is not configured");
        }

        const decoded = jwt.verify(token, jwtSecret) as any;
 
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            status: decoded.status
        } as any;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedException("Invalid token");
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedException("Token expired");
        }
        throw error;
    }
};

export class AuthMiddleware {
    static authenticate = authenticate;
}