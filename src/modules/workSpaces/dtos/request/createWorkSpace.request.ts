import { z } from "zod";

export const workSpaceCreateRequestDto = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(255).optional(),
})

export type WorkSpaceCreateRequestDtoType = z.infer<typeof workSpaceCreateRequestDto>;