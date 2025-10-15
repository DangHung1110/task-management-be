import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../Base";
import { WorkSpaces } from "../Workspaces";
import { User } from "../User";
import { BoardMember } from "./boardMember.entities";
import { List } from "../Lists";

export enum BoardVisibility {
    PRIVATE = "private",
    WORKSPACE = "workspace",
    PUBLIC = "public"
}

@Entity("boards")
export class Board extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid" })
    workspaceId!: string;

    @ManyToOne(() => WorkSpaces, { onDelete: "CASCADE" })
    @JoinColumn({ name: "workspaceId" })
    workspace!: WorkSpaces;

    @Column({ type: "uuid" })
    ownerId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "ownerId" })
    owner!: User;

    @OneToMany(() => List, list => list.board)
    lists!: List[];

    @OneToMany(() => BoardMember, member => member.board)
    members!: BoardMember[];

    @Column({
        type: "enum",
        enum: BoardVisibility,
        default: BoardVisibility.WORKSPACE
    })
    visibility!: BoardVisibility;

    @Column({ type: "varchar", length: 7, nullable: true })
    backgroundColor!: string | null; 

    @Column({ type: "varchar", length: 255, nullable: true })
    backgroundImage!: string | null;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "boolean", default: false })
    isFavorite!: boolean;

    @Column({ type: "boolean", default: false })
    isClosed!: boolean;

    @Column({ type: "timestamp", nullable: true })
    closedAt!: Date | null;

    @Column({ type: "jsonb", nullable: true })
    settings!: Record<string, any> | null;
}
