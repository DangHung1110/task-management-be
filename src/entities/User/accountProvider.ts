import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { BaseEntity } from "../Base";

export enum ProviderType {
    GOOGLE = "Google",
    FACEBOOK = "Facebook",
    GITHUB = "GitHub",
}

@Entity("account_providers")
export class AccountProvider extends BaseEntity {
    @ManyToOne(() => User, user => user.accountProviders)
    user!: User;

    @Column({ type: "enum", enum: ProviderType })
    provider!: ProviderType;

    @Column({ type: "varchar" })
    providerId!: string;

    @Column({ type: "varchar", nullable: true })
    accessToken?: string;

    @Column({ type: "varchar", nullable: true })
    refreshToken?: string;

}
