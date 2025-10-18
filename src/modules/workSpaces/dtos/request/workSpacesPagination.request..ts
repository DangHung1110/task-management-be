import { z } from "zod";

export const GetWorkSpacesPaginationQueryDto = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("5"),
  search: z.string().optional(),
  total: z.string().optional().default("true"),
});

export type GetWorkSpacesPaginationQueryDtoType = z.infer<typeof GetWorkSpacesPaginationQueryDto>;