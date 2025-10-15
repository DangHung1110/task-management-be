import { z } from "zod";

export const UpdateUserResponseDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateUserResponseDtoType = z.infer<typeof UpdateUserResponseDto>;