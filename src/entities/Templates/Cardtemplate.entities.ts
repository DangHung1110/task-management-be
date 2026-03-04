import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../Base";
import { ListTemplate } from "./ListTemplate.entities";

export enum CardTemplatePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

@Entity("card_templates")
export class CardTemplate extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "uuid", name: "list_template_id" })
    listTemplateId!: string;

    @ManyToOne(() => ListTemplate, listTemplate => listTemplate.cardTemplates, { onDelete: "CASCADE" })
    @JoinColumn({ name: "list_template_id" })
    listTemplate!: ListTemplate;

    @Column({ type: "int", default: 0 })
    position!: number;

    @Column({
        type: "enum",
        enum: CardTemplatePriority,
        nullable: true
    })
    priority!: CardTemplatePriority | null;

    @Column({ type: "varchar", length: 7, nullable: true, name: "cover_color" })
    coverColor!: string | null;

    @Column({ type: "text", nullable: true })
    labels!: string | null;

    @Column({ type: "text", nullable: true })
    checklist!: string | null;
}
