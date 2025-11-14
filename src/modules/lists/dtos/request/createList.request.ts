import { z } from 'zod';

export const createListRequestDto = z.object({
    name: z.string().min(1).max(255),
});

export type CreateListRequestDtoType = z.infer<typeof createListRequestDto>;