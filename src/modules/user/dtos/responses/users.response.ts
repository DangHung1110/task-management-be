import { z } from "zod";

// User schema for array items
export const UserItemDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pagination metadata schema
export const PaginationMetaDto = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
  total: z.number().min(0),
  search: z.string().optional(),
});

// Users list response schema
export const GetUsersResponseDto = z.object({
  data: z.array(UserItemDto),
  pagination: PaginationMetaDto,
});

export type UserItemDtoType = z.infer<typeof UserItemDto>;
export type PaginationMetaDtoType = z.infer<typeof PaginationMetaDto>;
export type GetUsersResponseDtoType = z.infer<typeof GetUsersResponseDto>;
