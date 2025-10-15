import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Account } from "./account";
import { Token } from "./token";
import { Otp } from "./otp";
import { UserRole } from "../Role/userRole";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    avatar!: string;

    @Column({ type: "boolean", default: false })
    isVerified!: boolean;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @OneToMany(() => Account, account => account.user)
    accounts!: Account[];

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];

    @OneToMany(() => Otp, otp => otp.user)
    otps!: Otp[];

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles!: UserRole[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
