import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { BaseEntity } from "../Base";
import e from "cors";

@Entity("accounts")
export class Account extends BaseEntity {
    @ManyToOne(() => User, user => user.accounts)
    user!: User;

    @Column({ type: "varchar", unique: true })
    username!: string;

    @Column({ type: "varchar" })
    passwordHash!: string;
}
