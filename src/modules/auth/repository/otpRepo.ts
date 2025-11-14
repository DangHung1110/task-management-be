import { Repository } from "typeorm";
import { AppDataSource } from "../../../config";
import { Otp, OtpType } from "../../../entities/User";
import otpConfig from "../../../config/otp.config";
import crypto from "crypto";

export class OtpRepository extends Repository<Otp> {
  constructor() {
    super(Otp, AppDataSource.createEntityManager());
  }

  private generateOtpCode(): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < otpConfig.otpLength; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
  }

  async createOtp(
    userId: string,
    type: OtpType,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Otp> {
    // Invalidate old OTPs
    await this.update(
      { userId, type, isUsed: false },
      { isUsed: true }
    );

    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + otpConfig.otpExpiry * 60 * 1000);

    const otp = this.create({
      code,
      type,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return await this.save(otp);
  }

  async verifyOtp(
    userId: string,
    code: string,
    type: OtpType
  ): Promise<{ valid: boolean; otp?: Otp; message?: string }> {
    const otp = await this.findOne({
      where: { userId, code, type, isUsed: false },
      relations: ["user"],
    });

    if (!otp) {
      return { valid: false, message: "Invalid OTP" };
    }

    if (new Date() > otp.expiresAt) {
      return { valid: false, message: "OTP expired" };
    }

    if (otp.attempts >= otpConfig.maxAttempts) {
      return { valid: false, message: "Too many attempts" };
    }

    otp.attempts += 1;
    await this.save(otp);

    return { valid: true, otp };
  }


  async markAsUsed(otpId: string): Promise<void> {
    await this.update(otpId, {
      isUsed: true,
      usedAt: new Date(),
    });
  }

  async checkRateLimit(userId: string, type: OtpType): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const count = await this.count({
      where: {
        userId,
        type,
        createdAt: oneHourAgo as any, // TypeORM will handle the comparison
      },
    });

    return count < otpConfig.maxRequestsPerHour;
  }

  async cleanExpiredOtps(): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where("expiresAt < :now", { now: new Date() })
      .andWhere("isUsed = :isUsed", { isUsed: false })
      .execute();
  }
}