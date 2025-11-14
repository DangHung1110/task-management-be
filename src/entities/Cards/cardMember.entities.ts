import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../Base";
import { Card } from "./card.entities";
import { User } from "../User";

@Entity("card_members")
@Unique(["cardId", "userId"])
export class CardMember extends BaseEntity {
    @Column({ type: "uuid" })
    cardId!: string;

    @ManyToOne(() => Card, card => card.members, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cardId" })
    card!: Card;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ type: "timestamp", nullable: true })
    assignedAt!: Date | null;

    @Column({ type: "uuid", nullable: true })
    assignedBy!: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "assignedBy" })
    assignedByUser!: User;
}
