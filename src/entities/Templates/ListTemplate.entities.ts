import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../Base";
import { BoardTemplate } from "./BoardTemplate.entities";
import { CardTemplate } from "./Cardtemplate.entities";

@Entity("list_templates")
export class ListTemplate extends BaseEntity {
    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "uuid", name: "board_template_id" })
    boardTemplateId!: string;

    @ManyToOne(() => BoardTemplate, boardTemplate => boardTemplate.listTemplates, { onDelete: "CASCADE" })
    @JoinColumn({ name: "board_template_id" })
    boardTemplate!: BoardTemplate;

    @Column({ type: "int", default: 0 })
    position!: number;

    @OneToMany(() => CardTemplate, cardTemplate => cardTemplate.listTemplate, {
        cascade: true
    })
    cardTemplates!: CardTemplate[];

    @Column({ type: "int", default: 0, name: "card_limit" })
    cardLimit!: number;
}
