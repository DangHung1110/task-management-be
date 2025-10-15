import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { Card } from "../Cards";
import { User } from "../User";

@Entity("comments")
export class Comment extends BaseEntity {
    @Column({ type: "text" })
    content!: string;

    @Column({ type: "uuid" })
    cardId!: string;

    @ManyToOne(() => Card, card => card.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cardId" })
    card!: Card;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "uuid", nullable: true })
    parentId!: string | null; // For reply to comment

    @ManyToOne(() => Comment, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "parentId" })
    parent!: Comment;

    @Column({ type: "boolean", default: false })
    isEdited!: boolean;

    @Column({ type: "timestamp", nullable: true })
    editedAt!: Date | null;

    @Column({ type: "jsonb", nullable: true })
    mentions!: string[] | null; // Array of user IDs mentioned in comment
}
