import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { Checklist } from "./checklist.entities";
import { User } from "../User";

@Entity("checklist_items")
export class ChecklistItem extends BaseEntity {
    @Column({ type: "varchar", length: 500 })
    content!: string;

    @Column({ type: "uuid" })
    checklistId!: string;

    @ManyToOne(() => Checklist, checklist => checklist.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "checklistId" })
    checklist!: Checklist;

    @Column({ type: "boolean", default: false })
    isCompleted!: boolean;

    @Column({ type: "timestamp", nullable: true })
    completedAt!: Date | null;

    @Column({ type: "uuid", nullable: true })
    completedBy!: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "completedBy" })
    completedByUser!: User;

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({ type: "timestamp", nullable: true })
    dueDate!: Date | null;
}
