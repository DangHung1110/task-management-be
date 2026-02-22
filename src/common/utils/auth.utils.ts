import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import crypto from "crypto"
import dotenv from "dotenv"
import { AppDataSource } from "../../config"
import { UserRole } from "../../entities"
import { cacheService } from "../cache/cache.service"

dotenv.config()

export class AuthUtils {
    private static readonly JWT_SECRET: string = process.env.JWT_SECRET_KEY || "supersecret"
    private static readonly JWT_EXPIRES_IN = "5m"

    static async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }

    static generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN } as SignOptions)
    }

    static verifyAccessToken(token: string): any {
        return jwt.verify(token, this.JWT_SECRET)
    }

    static generateRefreshToken(): string {
        return crypto.randomBytes(32).toString("hex")
    }

    static async getUserRolesAndPermissions(userId: string): Promise<{
        roles: string[];
        permissions: string[];
    }> {
        const cacheKey = `user:${userId}:roles_permissions`;
        const cacheTTL = 3600;

        const cached = await cacheService.get<{ roles: string[]; permissions: string[] }>(cacheKey);    
        if (cached) {
            return cached;
        }
                 
        const userRoleRepo = AppDataSource.getRepository(UserRole);
        
        const userRoles = await userRoleRepo.find({
            where: { userId },
            relations: ["role", "role.permissions"]
        });

        const roles = userRoles.map(ur => ur.role.name);
        const permissionsSet = new Set<string>();

        userRoles.forEach(ur => {
            ur.role.permissions?.forEach(permission => {
                permissionsSet.add(permission.permissionName);});
        });

        const result = {
            roles,
            permissions: Array.from(permissionsSet)
        };
        
        await cacheService.set(cacheKey, result, {
            ttl: cacheTTL
        });

        return result;
    }
    
    static async invalidateUserCache(userId: string): Promise<void> {
        const pattern = `user:${userId}:*`;
        await cacheService.deletePattern(pattern);
    }
}
