import { z } from 'zod';

export const swapListPositionRequestDto = z.object({
    firstListId: z.string().uuid(),
    secondListId: z.string().uuid(),
});

export type SwapListPositionRequestDtoType = z.infer<typeof swapListPositionRequestDto>;

