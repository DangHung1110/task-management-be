import { z } from "zod";
import { TemplateVisibility, TemplateCategory } from "../../../../entities";

export const boardTemplatePaginationRequestDto = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    visibility: z.nativeEnum(TemplateVisibility).optional(),
    category: z.nativeEnum(TemplateCategory).optional(),
    workspaceId: z.string().uuid().optional(),
    isSystem: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type BoardTemplatePaginationRequestDtoType = z.infer<typeof boardTemplatePaginationRequestDto>;

export const BoardTemplatePaginationRequestSchema = boardTemplatePaginationRequestDto.openapi({
    example: {
        page: 1,
        limit: 10,
        search: "development",
        category: TemplateCategory.DEVELOPMENT,
        isSystem: true,
    }
});
