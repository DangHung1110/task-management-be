import { z } from "zod";

export const swapCardPositionRequestDto = z.object({
	firstCardId: z.string().uuid(),
	secondCardId: z.string().uuid(),
});

export type SwapCardPositionRequestDtoType = z.infer<typeof swapCardPositionRequestDto>;


