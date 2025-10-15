import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { Card } from "../Cards";
import { User } from "../User";

@Entity("attachments")
export class Attachment extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    fileName!: string;

    @Column({ type: "varchar", length: 500 })
    fileUrl!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    fileType!: string | null; 

    @Column({ type: "bigint", nullable: true })
    fileSize!: number | null; 

    @Column({ type: "uuid" })
    cardId!: string;

    @ManyToOne(() => Card, card => card.attachments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cardId" })
    card!: Card;

    @Column({ type: "uuid" })
    uploadedBy!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "uploadedBy" })
    uploader!: User;

    @Column({ type: "boolean", default: false })
    isCover!: boolean; 

    @Column({ type: "varchar", length: 500, nullable: true })
    thumbnailUrl!: string | null;
}
