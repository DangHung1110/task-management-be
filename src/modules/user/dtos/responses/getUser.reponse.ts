import { z } from "zod";

export const GetUserResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetUserResponseDtoType = z.infer<typeof GetUserResponseDto>;