import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Account } from "./account";
import { AccountProvider } from "./accountProvider";
import { Token } from "./token";
import { UserRole } from "../Role";
import { BaseEntity } from "../Base";

@Entity("users")
export class User extends BaseEntity {
    @Column({ type: "varchar", unique: true, length: 150 })
    email!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    bio!: string;

    @Column({ type: "varchar", nullable: true })
    address!: string;

    @Column({ type: "varchar", nullable: true })
    avatarUrl!: string;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @OneToMany(() => Account, account => account.user)
    accounts!: Account[];

    @OneToMany(() => AccountProvider, ap => ap.user)
    accountProviders!: AccountProvider[];

    @OneToMany(() => UserRole, ur => ur.user)
    roles!: UserRole[];

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];
}
