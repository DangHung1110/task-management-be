import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "../Base";
import { List } from "../Lists";
import { User } from "../User";
import { Label } from "../Labels";
import { CardMember } from "./cardMember.entities";
import { Checklist } from "../Checklists";
import { Comment } from "../Comments";
import { Attachment } from "../Attachments";

export enum CardPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

@Entity("cards")
export class Card extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid" })
    listId!: string;

    @ManyToOne(() => List, list => list.cards, { onDelete: "CASCADE" })
    @JoinColumn({ name: "listId" })
    list!: List;

    @Column({ type: "uuid", nullable: true })
    creatorId!: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "creatorId" })
    creator!: User;

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({ type: "timestamp", nullable: true })
    startDate!: Date | null;

    @Column({ type: "timestamp", nullable: true })
    dueDate!: Date | null;

    @Column({ type: "boolean", default: false })
    isCompleted!: boolean;

    @Column({ type: "timestamp", nullable: true })
    completedAt!: Date | null;

    @Column({
        type: "enum",
        enum: CardPriority,
        nullable: true
    })
    priority!: CardPriority | null;

    @Column({ type: "varchar", length: 7, nullable: true })
    coverColor!: string | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    coverImage!: string | null;

    @Column({ type: "boolean", default: false })
    isArchived!: boolean;

    @Column({ type: "timestamp", nullable: true })
    archivedAt!: Date | null;

    @Column({ type: "int", default: 0 })
    commentCount!: number;

    @Column({ type: "int", default: 0 })
    attachmentCount!: number;

    @Column({ type: "int", default: 0 })
    checklistCount!: number;

    @Column({ type: "int", default: 0 })
    completedChecklistCount!: number;

    @OneToMany(() => CardMember, cardMember => cardMember.card)
    members!: CardMember[];

    @ManyToMany(() => Label)
    @JoinTable({
        name: "card_labels",
        joinColumn: { name: "cardId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "labelId", referencedColumnName: "id" }
    })
    labels!: Label[];

    @OneToMany(() => Checklist, checklist => checklist.card)
    checklists!: Checklist[];

    @OneToMany(() => Comment, comment => comment.card)
    comments!: Comment[];

    @OneToMany(() => Attachment, attachment => attachment.card)
    attachments!: Attachment[];

    @Column({ type: "boolean", default: true })
    isActive!: boolean;
}
