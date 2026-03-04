import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
} from "typeorm";
import { User } from "../User/user";
import { WorkSpaces } from "../Workspaces/workspaces.entities";
import { ListTemplate } from "./ListTemplate.entities";
import { BaseEntity } from "../Base";
export enum TemplateVisibility {
    PUBLIC = "public",
    PRIVATE = "private",
    SYSTEM = "system"
}

export enum TemplateCategory {
    DEVELOPMENT = "development",
    MARKETING = "marketing",
    DESIGN = "design",
    SALES = "sales",
    HR = "hr",
    FINANCE = "finance",
    EDUCATION = "education",
    PERSONAL = "personal",
    OTHER = "other"
}

@Entity("board_templates")
export class BoardTemplate extends BaseEntity {
    @Column({type: "varchar", length: 255})
    name!: string;

    @Column({type: "text", nullable: true})
    description?: string;

    @Column({type: "varchar", length: 20, default: TemplateVisibility.PRIVATE})
    visibility!: TemplateVisibility;

    @Column({type: "varchar", length: 100, nullable: true})
    category!: TemplateCategory | null;

    @Column({ type: "boolean", default: false, name: "is_system" })
    isSystem?: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    icon!: string | null;

    @Column({ type: "varchar", length: 20, nullable: true })
    color!: string | null;

    @Column({ type: "uuid", name: "creator_id", nullable: true })
    creatorId!: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "creator_id" })
    creator!: User | null;

    @Column({ type: "uuid", name: "workspace_id", nullable: true })
    workspaceId!: string | null;

    @ManyToOne(() => WorkSpaces, { nullable: true })
    @JoinColumn({ name: "workspace_id" })
    workspace!: WorkSpaces | null;

    @OneToMany(() => ListTemplate, listTemplate => listTemplate.boardTemplate, {
        cascade: true
    })
    listTemplates!: ListTemplate[];

    @Column({ type: "int", default: 0, name: "usage_count" })
    usageCount!: number;

    @Column({ type: "boolean", default: true, name: "is_active" })
    isActive!: boolean;

    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt!: Date | null;
    
}