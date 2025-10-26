import { z } from "zod";

export const getBoardsPaginationQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(), 
    total: z.string().optional(),
    workspaceId: z.string().uuid().optional(),
});

export type GetBoardsPaginationQueryDtoType = z.infer<typeof getBoardsPaginationQueryDto>;