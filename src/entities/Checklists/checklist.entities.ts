import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../Base";
import { Card } from "../Cards";
import { ChecklistItem } from "./checklistItem.entities";

@Entity("checklists")
export class Checklist extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "uuid" })
    cardId!: string;

    @ManyToOne(() => Card, card => card.checklists, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cardId" })
    card!: Card;

    @Column({ type: "int", default: 0 })
    position!: number;

    @OneToMany(() => ChecklistItem, item => item.checklist)
    items!: ChecklistItem[];

    @Column({ type: "int", default: 0 })
    itemCount!: number;

    @Column({ type: "int", default: 0 })
    completedItemCount!: number;
}
