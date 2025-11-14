import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../Base";
import { WorkSpaces } from "./workspaces.entities";
import { User } from "../User";

export enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}

@Entity("workspace_invitations")
@Index(["workspaceId", "email"])
@Index(["token"])
export class WorkspaceInvitation extends BaseEntity {
    @Column({ type: "uuid" })
    workspaceId!: string;

    @ManyToOne(() => WorkSpaces, { onDelete: "CASCADE" })
    @JoinColumn({ name: "workspaceId" })
    workspace!: WorkSpaces;

    @Column({ type: "varchar", length: 255 })
    email!: string;

    @Column({ type: "uuid", nullable: true })
    invitedByUserId!: string | null;

    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "invitedByUserId" })
    invitedByUser!: User | null;

    @Column({ type: "uuid", nullable: true })
    userId!: string | null; 

    @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User | null;

    @Column({ type: "varchar", length: 255, unique: true })
    token!: string;

    @Column({
        type: "enum",
        enum: InvitationStatus,
        default: InvitationStatus.PENDING
    })
    status!: InvitationStatus;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @Column({ type: "timestamp", nullable: true })
    acceptedAt!: Date | null;
}

