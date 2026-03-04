import { z } from "zod";
import { TemplateVisibility, TemplateCategory } from "../../../../entities";
import { cardTemplateSchema, listTemplateSchema } from "./createBoardTemplate.request";

export const updateBoardTemplateRequestDto = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    visibility: z.nativeEnum(TemplateVisibility).optional(),
    category: z.nativeEnum(TemplateCategory).optional(),
    icon: z.string().max(50).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    isActive: z.boolean().optional(),
    listTemplates: z.array(listTemplateSchema).optional(),
});

export type UpdateBoardTemplateRequestDtoType = z.infer<typeof updateBoardTemplateRequestDto>;

export const UpdateBoardTemplateRequestSchema = updateBoardTemplateRequestDto.openapi({
    example: {
        name: "Updated Template Name",
        description: "Updated description",
        visibility: TemplateVisibility.PUBLIC,
        isActive: true,
    }
});
