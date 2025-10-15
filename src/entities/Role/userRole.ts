import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../User/user";
import { Role } from "./role";

@Entity("user_roles")
export class UserRole {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid" })
    userId!: string;

    @Column({ type: "uuid" })
    roleId!: string;

    @ManyToOne(() => User, user => user.userRoles)
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Role, role => role.userRoles)
    @JoinColumn({ name: "roleId" })
    role!: Role;

    @CreateDateColumn()
    createdAt!: Date;
}
