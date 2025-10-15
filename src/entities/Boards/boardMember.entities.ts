import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../Base";
import { User } from "../User";
import { Board } from "./board.entities";

export enum BoardMemberRole {
    ADMIN = "admin",
    MEMBER = "member",
    OBSERVER = "observer"
}

@Entity("board_members")
@Unique(["boardId", "userId"])
export class BoardMember extends BaseEntity {
    @Column({ type: "uuid" })
    boardId!: string;

    @ManyToOne(() => Board, board => board.members, { onDelete: "CASCADE" })
    @JoinColumn({ name: "boardId" })
    board!: Board;

    @Column({ type: "uuid" })
    userId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({
        type: "enum",
        enum: BoardMemberRole,
        default: BoardMemberRole.MEMBER
    })
    role!: BoardMemberRole;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "timestamp", nullable: true })
    invitedAt!: Date | null;

    @Column({ type: "timestamp", nullable: true })
    joinedAt!: Date | null;
}
