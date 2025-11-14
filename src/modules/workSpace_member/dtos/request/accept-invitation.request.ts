import { z } from "zod";

export const acceptInvitationRequestSchema = z.object({
    token: z.string().uuid("Invalid invitation token"),
});

export type AcceptInvitationRequestType = z.infer<typeof acceptInvitationRequestSchema>;

