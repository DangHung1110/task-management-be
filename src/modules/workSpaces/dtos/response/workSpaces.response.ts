import { z } from 'zod';

export const ownerInfSchema = z.object({
    id: z.string(),
    name: z.string(),
})

export const memberInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    role:z.enum(['admin', 'member']),
    joinedAt: z.date().nullable(),
})


export const WorkSpacesResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    owner: ownerInfSchema,
    members: z.array(memberInfoSchema),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export const paginationMetaSchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    search: z.string().optional(),
});

export const WorkSpacesListResponseSchema = z.object({
    data: z.array(WorkSpacesResponseSchema),
    pagination: paginationMetaSchema,
});

export type WorkSpacesListResponseType = z.infer<typeof WorkSpacesListResponseSchema>;
export type WorkSpacesResponseType = z.infer<typeof WorkSpacesResponseSchema>;