import { z } from 'zod';

export const getListSchema = z.object({
    id: z.string(),
    name: z.string(),
    boardId: z.string(),
    isActive: z.boolean(),
    position: z.number(),
    isArchived: z.boolean(),
    archivedAt: z.date().nullable(),
    cardLimit: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const paginationMetaSchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    search: z.string().optional(),
});

export const getListsResponseSchema = z.object({
    data: getListSchema.array(),
    pagination: paginationMetaSchema,
})

export type GetListResponseType = z.infer<typeof getListSchema>;
export type GetListsResponseType = z.infer<typeof getListsResponseSchema>;
