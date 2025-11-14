import { z } from "zod";

export const inviteMemberRequestSchema = z.object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["owner", "member"]).default("member").optional(),
});

export type InviteMemberRequestType = z.infer<typeof inviteMemberRequestSchema>;

