import { z } from "zod";

export const workSpaceUpdateRequestDto = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(255).optional(),
    logoUrl: z.string().url().optional(),
    type: z.string().max(50).optional(),
});

export type WorkSpaceUpdateRequestDtoType = z.infer<typeof workSpaceUpdateRequestDto>;