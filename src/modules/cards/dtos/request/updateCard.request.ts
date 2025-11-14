import { z } from "zod";

export const updateCardRequestDto = z.object({
	title: z.string().min(1).max(255).optional(),
	description: z.string().nullable().optional(),
	isArchived: z.boolean().optional(),
	priority: z.string().optional(),
	startDate: z.coerce.date().nullable().optional(),
	dueDate: z.coerce.date().nullable().optional(),
	coverColor: z.string().length(7).nullable().optional(),
	coverImage: z.string().max(255).nullable().optional(),
});

export type UpdateCardRequestDtoType = z.infer<typeof updateCardRequestDto>;


