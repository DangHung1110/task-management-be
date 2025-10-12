import { z } from "zod";

export const CreateUserResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateUserResponseDtoType = z.infer<typeof CreateUserResponseDto>;