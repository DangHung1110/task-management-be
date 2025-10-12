import { z } from "zod";

export const GetUsersPaginationQueryDto = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  total: z.string().optional().default("true"),
});

export type GetUsersPaginationQueryDtoType = z.infer<typeof GetUsersPaginationQueryDto>;