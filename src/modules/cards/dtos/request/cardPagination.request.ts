import { z } from "zod";

export const getCardsPaginationRequestDto = z.object({
	page: z.string().optional(),
	limit: z.string().optional(),
	search: z.string().optional(),
	total: z.string().optional(),
	listId: z.string().uuid().optional(),
});

export type GetCardsPaginationRequestDtoType = z.infer<typeof getCardsPaginationRequestDto>;


