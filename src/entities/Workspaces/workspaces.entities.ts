import { Entity, Column, ManyToOne, JoinColumn, OneToMany, DeleteDateColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { User } from "../User";
import { WorkspaceMembers } from "./workspaceMember.entities";

@Entity("workspaces")
export class WorkSpaces extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid" })
    ownerId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "ownerId" })
    owner!: User;

    @OneToMany(() => WorkspaceMembers, member => member.workspace)
    members!: WorkspaceMembers[];

    @Column({ type: "varchar", length: 255, nullable: true })
    logoUrl!: string | null;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    type!: string | null;

    @Column({ type: "jsonb", nullable: true })
    settings!: Record<string, any> | null;

    @DeleteDateColumn({ name: "deletedAt" })
    deletedAt?: Date;
}