import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { Board } from "../Boards";

@Entity("labels")
export class Label extends BaseEntity {
    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", length: 7 })
    color!: string; 

    @Column({ type: "uuid" })
    boardId!: string;

    @ManyToOne(() => Board, { onDelete: "CASCADE" })
    @JoinColumn({ name: "boardId" })
    board!: Board;

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;
}
