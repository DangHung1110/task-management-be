import { z } from "zod";

export const memberResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
    }),
    role: z.enum(["owner", "member"]),
    isActive: z.boolean(),
    invitedAt: z.date().nullable(),
    joinedAt: z.date().nullable(),
});

export type MemberResponseType = z.infer<typeof memberResponseSchema>;

