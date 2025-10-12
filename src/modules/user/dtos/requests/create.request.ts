import { z } from "zod";

export const CreateUserDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
