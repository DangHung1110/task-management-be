import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../Base/baseEntities";
import { User } from "./user";

export enum OtpType {
  RESET_PASSWORD = "reset_password",
  VERIFY_EMAIL = "verify_email",
  TWO_FACTOR = "two_factor",
}

@Entity("otps")
@Index(["userId", "type", "isUsed"])
export class Otp extends BaseEntity {
  @Column({ type: "varchar", length: 10 })
  code!: string;

  @Column({
    type: "enum",
    enum: OtpType,
    default: OtpType.RESET_PASSWORD,
  })
  type!: OtpType;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "boolean", default: false })
  isUsed!: boolean;

  @Column({ type: "timestamp", nullable: true })
  usedAt!: Date | null;

  @Column({ type: "int", default: 0 })
  attempts!: number;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "text", nullable: true })
  userAgent!: string | null;
}