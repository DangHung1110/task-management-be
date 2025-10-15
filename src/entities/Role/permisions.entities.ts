import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role";

@Entity("permissions")
export class Permission {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    name!: string; 

    @Column({ type: "varchar" })
    resource!: string; 

    @Column({ type: "varchar" })
    action!: string; 

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @ManyToMany(() => Role, role => role.permissions)
    roles!: Role[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}