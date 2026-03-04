import { z } from "zod";
import { TemplateVisibility, TemplateCategory } from "../../../../entities";

export const cardTemplateSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    position: z.number().int().min(0).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    labels: z.string().optional(),
    checklist: z.string().optional(),
});

export const listTemplateSchema = z.object({
    name: z.string().min(1).max(255),
    position: z.number().int().min(0).optional(),
    cardLimit: z.number().int().min(0).optional(),
    cardTemplates: z.array(cardTemplateSchema).optional(),
});

export const createBoardTemplateRequestDto = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    visibility: z.nativeEnum(TemplateVisibility).default(TemplateVisibility.PRIVATE),
    category: z.nativeEnum(TemplateCategory).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    workspaceId: z.string().uuid().optional(),
    listTemplates: z.array(listTemplateSchema).optional(),
});

export type CreateBoardTemplateRequestDtoType = z.infer<typeof createBoardTemplateRequestDto>;

export const CreateBoardTemplateRequestSchema = createBoardTemplateRequestDto.openapi({
    example: {
        name: "Software Development Board",
        description: "Template for managing software development projects",
        visibility: TemplateVisibility.PUBLIC,
        category: TemplateCategory.DEVELOPMENT,
        icon: "💻",
        color: "#0079BF",
        listTemplates: [
            {
                name: "Backlog",
                position: 0,
                cardTemplates: [
                    {
                        title: "User Story Template",
                        description: "As a [user], I want [goal] so that [benefit]",
                        position: 0,
                        priority: "medium",
                    }
                ]
            },
            {
                name: "In Progress",
                position: 1,
            },
            {
                name: "Done",
                position: 2,
            }
        ]
    }
});
