import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../Base";
import { UserRole } from "./userRole";
import { Permission } from "./permisions.entities";

@Entity("roles")
export class Role extends BaseEntity {
    @Column({ type: "varchar", unique: true })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles!: UserRole[];

    @OneToMany(() => Permission, permission => permission.role)
    permissions!: Permission[];
}
