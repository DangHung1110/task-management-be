import { z } from "zod";

export const UpdateUserDto = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    age: z.number().optional(),

})

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;