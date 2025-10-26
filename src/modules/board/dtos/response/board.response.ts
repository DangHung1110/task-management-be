import { z } from "zod";

export const boardResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    workSpaceId: z.string(),
    workSpace: {
        id: z.string(),
        name: z.string(),
    },
    owner: {
        id: z.string(),
        name: z.string(),
    },
    member: z.array(z.object({
        id: z.string(),
        name: z.string(),
        role: z.enum(['admin', 'member']),
        joinedAt: z.date().nullable(),
    })),
    visibility: z.enum(['public', 'private', 'workspace']),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const paginationMetaSchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    search: z.string().optional(),
});

export const listBoardsResponseSchema = z.object({
    data: z.array(boardResponseSchema),
    pagination: paginationMetaSchema,
});

export type BoardResponseType = z.infer<typeof boardResponseSchema>;
export type BoardsListResponseType = z.infer<typeof listBoardsResponseSchema>;
