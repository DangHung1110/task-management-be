import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions";
import dotenv from "dotenv";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        status: string;
    };
}

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
        };

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
    static authenticate = authMiddleware;
}