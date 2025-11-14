import { z } from 'zod';

export const getListpagiantionRequestDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    total: z.string().optional(),
    boardId: z.string().uuid().optional(),  
})

export type GetListPaginationRequestDtoType = z.infer<typeof getListpagiantionRequestDto>;