import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { User } from "../User";
import { Activity } from "../Activities";

export enum NotificationType {
    ASSIGNED_TO_CARD = "assigned_to_card",
    MENTIONED_IN_COMMENT = "mentioned_in_comment",
    CARD_DUE_SOON = "card_due_soon",
    CARD_OVERDUE = "card_overdue",
    ADDED_TO_BOARD = "added_to_board",
    ADDED_TO_WORKSPACE = "added_to_workspace",
    COMMENT_REPLY = "comment_reply",
    CHECKLIST_COMPLETED = "checklist_completed",
    CARD_MOVED = "card_moved",
}

@Entity("notifications")
export class Notification extends BaseEntity {
    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({
        type: "enum",
        enum: NotificationType
    })
    type!: NotificationType;

    @Column({ type: "varchar", length: 500 })
    message!: string;

    @Column({ type: "boolean", default: false })
    isRead!: boolean;

    @Column({ type: "timestamp", nullable: true })
    readAt!: Date | null;

    @Column({ type: "uuid", nullable: true })
    activityId!: string | null;

    @ManyToOne(() => Activity, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "activityId" })
    activity!: Activity;

    @Column({ type: "jsonb", nullable: true })
    metadata!: Record<string, any> | null; 

    @Column({ type: "varchar", length: 500, nullable: true })
    actionUrl!: string | null; 
}
