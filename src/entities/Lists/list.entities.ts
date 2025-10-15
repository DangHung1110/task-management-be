import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../Base";
import { Board } from "../Boards";
import { Card } from "../Cards";

@Entity("lists")
export class List extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "uuid" })
    boardId!: string;

    @ManyToOne(() => Board, board => board.lists, { onDelete: "CASCADE" })
    @JoinColumn({ name: "boardId" })
    board!: Board;

    @OneToMany(() => Card, card => card.list)
    cards!: Card[];

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({ type: "boolean", default: false })
    isArchived!: boolean;

    @Column({ type: "timestamp", nullable: true })
    archivedAt!: Date | null;

    @Column({ type: "int", default: 0 })
    cardLimit!: number; // 0 means no limit
}
