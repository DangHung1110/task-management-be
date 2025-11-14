import { z } from "zod";

export const createCardRequestDto = z.object({
	title: z.string().min(1).max(255),
	description: z.string().nullable().optional(),
});

export type CreateCardRequestDtoType = z.infer<typeof createCardRequestDto>;


