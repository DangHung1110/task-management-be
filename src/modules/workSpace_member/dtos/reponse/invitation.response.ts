import { z } from "zod";

export const invitationResponseSchema = z.object({
    id: z.string(),
    email: z.string(),
    workspaceId: z.string(),
    workspaceName: z.string(),
    status: z.enum(["pending", "accepted", "expired", "cancelled"]),
    invitedBy: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
    expiresAt: z.date(),
    createdAt: z.date(),
});

export type InvitationResponseType = z.infer<typeof invitationResponseSchema>;

