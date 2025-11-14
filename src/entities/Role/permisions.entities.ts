import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { Role } from "./role";

@Entity("permissions")
export class Permission extends BaseEntity {
    @Column({ type: "varchar" })
    permissionName!: string;

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @Column({ type: "uuid" })
    roleId!: string;

    @ManyToOne(() => Role, role => role.permissions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "roleId" })
    role!: Role;
}