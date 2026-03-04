import { z } from "zod";

export const cardTemplateResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    position: z.number(),
    priority: z.enum(["low", "medium", "high", "urgent"]).nullable(),
    coverColor: z.string().nullable(),
    labels: z.string().nullable(),
    checklist: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const listTemplateResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    position: z.number(),
    cardLimit: z.number(),
    cardTemplates: z.array(cardTemplateResponseSchema).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const boardTemplateResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    visibility: z.enum(["public", "private", "system"]),
    category: z.enum(["development", "marketing", "design", "sales", "hr", "finance", "education", "personal", "other"]).nullable(),
    isSystem: z.boolean(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    usageCount: z.number(),
    isActive: z.boolean(),
    creator: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
    workspace: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
    listTemplates: z.array(listTemplateResponseSchema).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const paginationMetaSchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    search: z.string().optional(),
});

export const listBoardTemplatesResponseSchema = z.object({
    data: z.array(boardTemplateResponseSchema),
    pagination: paginationMetaSchema,
});

export type CardTemplateResponseType = z.infer<typeof cardTemplateResponseSchema>;
export type ListTemplateResponseType = z.infer<typeof listTemplateResponseSchema>;
export type BoardTemplateResponseType = z.infer<typeof boardTemplateResponseSchema>;
export type BoardTemplatesListResponseType = z.infer<typeof listBoardTemplatesResponseSchema>;
