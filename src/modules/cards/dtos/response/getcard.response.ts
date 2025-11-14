import { z } from "zod";

export const getCardSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	listId: z.string(),
	creatorId: z.string().nullable(),
	position: z.number(),
	startDate: z.date().nullable(),
	dueDate: z.date().nullable(),
	isCompleted: z.boolean(),
	priority: z.string().nullable(),
	coverColor: z.string().nullable(),
	coverImage: z.string().nullable(),
	isArchived: z.boolean(),
	archivedAt: z.date().nullable(),
	commentCount: z.number(),
	attachmentCount: z.number(),
	checklistCount: z.number(),
	completedChecklistCount: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const cardsPaginationMetaSchema = z.object({
	page: z.number().min(1),
	limit: z.number().min(1),
	total: z.number().min(0),
	search: z.string().optional(),
});

export const getCardsResponseSchema = z.object({
	data: getCardSchema.array(),
	pagination: cardsPaginationMetaSchema,
});

export type GetCardResponseType = z.infer<typeof getCardSchema>;
export type GetCardsResponseType = z.infer<typeof getCardsResponseSchema>;


