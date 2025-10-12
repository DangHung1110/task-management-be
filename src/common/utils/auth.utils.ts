import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import crypto from "crypto"
import dotenv from "dotenv"

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
}
