import { AuthRepository } from "./repository/auth.repository";
import { AccountsRepository } from "./repository/accountsRepo";
import { OtpRepository } from "./repository/otpRepo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../entities/User/user";
import { 
    ConflictException, 
    NotFoundException,
    BadRequestException,
    UnauthorizedException
} from "../../common/exceptions/ErrorResponse.exceptions";    
import dotenv from "dotenv";
import { Request, Response } from "express";
import { AppDataSource } from "../../config";
import { OtpType } from "../../entities/User";
import { transporter, emailTemplates } from "../../config/mail.config";

dotenv.config();

export class AuthService {
    private authRepo: AuthRepository;
    private accountsRepo: AccountsRepository;
    private otpRepo: OtpRepository;
  
    constructor() {
        this.authRepo = new AuthRepository(AppDataSource);
        this.accountsRepo = new AccountsRepository();
        this.otpRepo = new OtpRepository();
    }

    async register(name: string, email: string, password: string): Promise<User> {
        const existingUser = await this.authRepo.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await this.authRepo.createUserWithAccount(
            { name, email },
            { username: email, passwordHash: hashedPassword }
        );
        
        return newUser;
    }

    async login(email: string, password: string) {
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }

        const account = await this.authRepo.findAccountByUsername(email);
        if (!account) {
            throw new NotFoundException('Account not found');
        }

        if (!user.isActive) {
            throw new NotFoundException('User account is not active');
        }

        const isPasswordValid = await bcrypt.compare(password, account.passwordHash);
        if (!isPasswordValid) {
            throw new NotFoundException('Invalid credentials');
        }

        const accesstoken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshtoken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );
        
        const userData = { userid: user.id, name: user.name, email: user.email };
        return { userData, accesstoken, refreshtoken }
    }

    async refreshToken(req: Request) {
        const refreshtoken = req.cookies?.refreshToken;
        if (!refreshtoken) {
            throw new NotFoundException('Refresh token not found');
        }

        const refreshSecret = process.env.REFRESH_JWT_SECRET_KEY as string;
        if (!refreshSecret) {
            throw new NotFoundException('Refresh token secret is not configured');
        }

        try {
            const payload = jwt.verify(refreshtoken, refreshSecret) as any;
            const { userId, email, role } = payload;

            const newAccessToken = jwt.sign(
                { userId, email, role },
                process.env.JWT_SECRET_KEY as string,
                { algorithm: "HS256", expiresIn: '5m' }
            );

            const newRefreshToken = jwt.sign(
                { userId, email, role },
                refreshSecret,
                { algorithm: "HS256", expiresIn: '7d' }
            );

            return {
                data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                msg: "This is new access token!"
            };
        } catch (err) {
            throw new NotFoundException('Invalid or expired refresh token');
        }
    }

    async googleLogin(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        if (!user) {
            throw new NotFoundException("This user doesnt exist!");
        }
        const findUser = await this.authRepo.findByEmail(user.email);
        if (!findUser) {
            throw new NotFoundException("This user doesnt exist!");
        }

        const payload = {
          userId: findUser.id,
          email: findUser.email,
          username: (findUser as any).username ?? "",
        };

        const accessToken = jwt.sign(
          { userId: payload.userId, email: payload.email },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
          { userId: payload.userId, email: payload.email },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async facebookLogin(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        if (!user) {
            throw new NotFoundException("This user doesnt exist!");
        }
        const findUser = await this.authRepo.findByEmail(user.email);
        if (!findUser) {
            throw new NotFoundException("This user doesnt exist!");
        }

        const payload = {
          userId: findUser.id,
          email: findUser.email,
          username: (findUser as any).username ?? "",
        };

        const accessToken = jwt.sign(
          { userId: payload.userId, email: payload.email },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
          { userId: payload.userId, email: payload.email },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async logout(token: string | undefined, res: Response) {
        if (!token) {
            throw new NotFoundException("Refresh Token not found!");
        }
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
        };
        res.clearCookie("refreshToken", cookieOptions);
        return { msg: "Logged out" };
    }

    async requestPasswordReset(
        email: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<{ success: boolean; message: string }> {
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            return { success: true, message: "If email exists, OTP will be sent" };
        }

        const canRequest = await this.otpRepo.checkRateLimit(user.id, OtpType.RESET_PASSWORD);
        if (!canRequest) {
            throw new BadRequestException("Too many requests. Please try again later.");
        }

        const otp = await this.otpRepo.createOtp(
            user.id,
            OtpType.RESET_PASSWORD,
            ipAddress,
            userAgent
        );

        const emailTemplate = emailTemplates.resetPassword(otp.code, user.name);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
        });

        return {
            success: true,
            message: "OTP sent to your email",
        };
    }

    async verifyPasswordResetOtp(
        email: string,
        code: string
    ): Promise<{ valid: boolean; token?: string; message?: string }> {
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const result = await this.otpRepo.verifyOtp(user.id, code, OtpType.RESET_PASSWORD);
        
        if (!result.valid) {
            throw new BadRequestException(result.message || "Invalid OTP");
        }

        await this.otpRepo.markAsUsed(result.otp!.id);

        const resetToken = jwt.sign(
            { userId: user.id, purpose: "reset_password" },
            process.env.JWT_SECRET_KEY as string,
            { expiresIn: "15m" }
        );

        return {
            valid: true,
            token: resetToken,
            message: "OTP verified successfully",
        };
    }

    async resetPassword(
        token: string,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;
            
            if (decoded.purpose !== "reset_password") {
                throw new UnauthorizedException("Invalid token purpose");
            }

            const user = await this.authRepo.findById(decoded.userId);
            if (!user) {
                throw new NotFoundException("User not found");
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const account = await this.accountsRepo.findByUserId(user.id);
            if (!account) {
                throw new NotFoundException("Account not found");
            }

            account.passwordHash = hashedPassword;
            await this.accountsRepo.save(account);

            const emailTemplate = emailTemplates.otpVerificationSuccess(user.name);
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
            });

            return {
                success: true,
                message: "Password reset successfully",
            };
        } catch (error: any) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw new UnauthorizedException("Invalid or expired token");
            }
            throw error;
        }
    }
}