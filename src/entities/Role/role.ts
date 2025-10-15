import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "./userRole";
import { Permission } from "./permisions.entities";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles!: UserRole[];

    @ManyToMany(() => Permission, (permission: { roles: any; }) => permission.roles)
    @JoinTable({
        name: "role_permissions",
        joinColumn: { name: "roleId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" }
    })
    permissions!: Permission[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
