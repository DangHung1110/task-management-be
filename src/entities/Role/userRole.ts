import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { User } from "../User/user";
import { Role } from "./role";

@Entity("user_roles")
export class UserRole extends BaseEntity {
    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, user => user.userRoles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "uuid" })
    roleId!: string;

    @ManyToOne(() => Role, role => role.userRoles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "roleId" })
    role!: Role;
}
