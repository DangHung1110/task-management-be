import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user";

@Entity("tokens")
export class Token {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, user => user.tokens)
    user!: User;

    @Column({ type: "varchar", unique: true })
    refreshToken!: string;

    @Column({ type: "timestamp" })
    expiredAt!: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
