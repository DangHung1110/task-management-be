import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { User } from "../User";
import { Card } from "../Cards";
import { Board } from "../Boards";
import { WorkSpaces } from "../Workspaces";

export enum ActivityType {
    // Card activities
    CARD_CREATED = "card_created",
    CARD_UPDATED = "card_updated",
    CARD_MOVED = "card_moved",
    CARD_ARCHIVED = "card_archived",
    CARD_DELETED = "card_deleted",
    CARD_RESTORED = "card_restored",
    
    // Member activities
    MEMBER_ADDED = "member_added",
    MEMBER_REMOVED = "member_removed",
    
    // Comment activities
    COMMENT_ADDED = "comment_added",
    COMMENT_UPDATED = "comment_updated",
    COMMENT_DELETED = "comment_deleted",
    
    // Attachment activities
    ATTACHMENT_ADDED = "attachment_added",
    ATTACHMENT_DELETED = "attachment_deleted",
    
    // Checklist activities
    CHECKLIST_ADDED = "checklist_added",
    CHECKLIST_COMPLETED = "checklist_completed",
    CHECKLIST_ITEM_CHECKED = "checklist_item_checked",
    CHECKLIST_ITEM_UNCHECKED = "checklist_item_unchecked",
    
    // Label activities
    LABEL_ADDED = "label_added",
    LABEL_REMOVED = "label_removed",
    
    // Due date activities
    DUE_DATE_ADDED = "due_date_added",
    DUE_DATE_CHANGED = "due_date_changed",
    DUE_DATE_REMOVED = "due_date_removed",
    
    // Board activities
    BOARD_CREATED = "board_created",
    BOARD_UPDATED = "board_updated",
    
    // List activities
    LIST_CREATED = "list_created",
    LIST_UPDATED = "list_updated",
    LIST_ARCHIVED = "list_archived",
}

@Entity("activities")
export class Activity extends BaseEntity {
    @Column({
        type: "enum",
        enum: ActivityType
    })
    type!: ActivityType;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "uuid", nullable: true })
    workspaceId!: string | null;

    @ManyToOne(() => WorkSpaces, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "workspaceId" })
    workspace!: WorkSpaces;

    @Column({ type: "uuid", nullable: true })
    boardId!: string | null;

    @ManyToOne(() => Board, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "boardId" })
    board!: Board;

    @Column({ type: "uuid", nullable: true })
    cardId!: string | null;

    @ManyToOne(() => Card, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "cardId" })
    card!: Card;

    @Column({ type: "jsonb", nullable: true })
    metadata!: Record<string, any> | null; 

    @Column({ type: "varchar", length: 50, nullable: true })
    entityType!: string | null;

    @Column({ type: "uuid", nullable: true })
    entityId!: string | null; 
}
