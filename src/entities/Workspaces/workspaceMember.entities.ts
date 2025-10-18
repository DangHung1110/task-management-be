import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { User } from "../User";
import { BaseEntity } from "../Base";
import { WorkSpaces } from "./workspaces.entities";

export enum WorkspaceMemberRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
}

@Entity("workspace_members")
@Unique(["workspaceId", "userId"])
export class WorkspaceMembers extends BaseEntity {
    @Column({ type: "uuid" })
    workspaceId!: string;

    @ManyToOne(() => WorkSpaces, workspace => workspace.members, { onDelete: "CASCADE" })
    @JoinColumn({ name: "workspaceId" })
    workspace!: WorkSpaces;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({
        type: "enum",
        enum: WorkspaceMemberRole,
        default: WorkspaceMemberRole.MEMBER
    })
    role!: WorkspaceMemberRole;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "timestamp", nullable: true })
    invitedAt!: Date | null;

    @Column({ type: "timestamp", nullable: true })
    joinedAt!: Date | null;
}
