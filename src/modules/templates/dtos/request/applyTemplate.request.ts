import { z } from "zod";

export const applyTemplateRequestDto = z.object({
    templateId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    boardName: z.string().min(1).max(255).optional(),
    boardDescription: z.string().optional(),
});

export type ApplyTemplateRequestDtoType = z.infer<typeof applyTemplateRequestDto>;

export const ApplyTemplateRequestSchema = applyTemplateRequestDto.openapi({
    example: {
        templateId: "550e8400-e29b-41d4-a716-446655440000",
        workspaceId: "660e8400-e29b-41d4-a716-446655440000",
        boardName: "My Project Board",
        boardDescription: "Board created from template",
    }
});
