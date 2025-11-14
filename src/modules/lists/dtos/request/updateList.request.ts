import { z } from 'zod';

export const updateListRequestDto = z.object({
    name: z.string().min(1).max(255).optional(),
    cardLimit: z.number().int().min(0).optional(),
    isArchived: z.boolean().optional(),
});

export type UpdateListRequestDtoType = z.infer<typeof updateListRequestDto>;

