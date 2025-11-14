import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";
import { WorkSpaceMemberController } from "./workSpace_member.controller";
import { WorkSpaceMemberService } from "./workSpace_member.service";
import { WorkSpaceMemberRepository } from "./repository";
import {
    inviteMemberRequestSchema,
    acceptInvitationRequestSchema,
    invitationResponseSchema,
    memberResponseSchema
} from "./dtos";
import {
    autoBindUtil,
    validateRequestMiddleware,
    authenticate,
    requirePermission
} from "../../common";
import { createApiResponse } from "../../swagger";
import { AppDataSource } from "../../config";
import { permissionEnum } from "../../config/seeders/rbac.seeder";
import { checkWorkspacePermission, WorkSpaceMemberEnum } from "../../common/middlewares/checkWorkspacePermission.middleware";

extendZodWithOpenApi(z);

const InviteMemberRequestSchema = inviteMemberRequestSchema.openapi({
    example: {
        email: "user@example.com",
        role: "member"
    }
});

const AcceptInvitationRequestSchema = acceptInvitationRequestSchema.openapi({
    example: {
        token: "123e4567-e89b-12d3-a456-426614174000"
    }
});

export const workSpaceMemberRegistry = new OpenAPIRegistry();

workSpaceMemberRegistry.register("InviteMemberRequest", InviteMemberRequestSchema);
workSpaceMemberRegistry.register("AcceptInvitationRequest", AcceptInvitationRequestSchema);
workSpaceMemberRegistry.register("InvitationResponse", invitationResponseSchema);
workSpaceMemberRegistry.register("MemberResponse", memberResponseSchema);

const memberRepo = new WorkSpaceMemberRepository(AppDataSource);
const memberService = new WorkSpaceMemberService(memberRepo);
const memberController = new WorkSpaceMemberController(memberService);
const router = express.Router({ mergeParams: true });
autoBindUtil(memberController);

// Small helper to forward async errors to the global error handler
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) =>
    (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Invite member to workspace
workSpaceMemberRegistry.registerPath({
    method: "post",
    path: "/workspaces/{workspaceId}/invite",
    tags: ["WorkSpace Members"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: InviteMemberRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        invitationResponseSchema,
        "Invitation sent successfully"
    ),
});
router.post(
    "/:workspaceId/invite",
    authenticate,
    checkWorkspacePermission([WorkSpaceMemberEnum.OWNER, WorkSpaceMemberEnum.MEMBER]),
    validateRequestMiddleware({ body: InviteMemberRequestSchema }),
    asyncHandler(memberController.inviteMember)
);

// Accept invitation
workSpaceMemberRegistry.registerPath({
    method: "post",
    path: "/workspaces/invitation/accept",
    tags: ["WorkSpace Members"],
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AcceptInvitationRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        memberResponseSchema,
        "Invitation accepted successfully"
    ),
});
router.post(
    "/invitation/accept",
    authenticate,
    validateRequestMiddleware({ body: AcceptInvitationRequestSchema }),
    asyncHandler(memberController.acceptInvitation)
);

// Get invitations for a workspace
workSpaceMemberRegistry.registerPath({
    method: "get",
    path: "/workspaces/{workspaceId}/invitations",
    tags: ["WorkSpace Members"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.array(invitationResponseSchema),
        "Invitations retrieved successfully"
    ),
});
router.get(
    "/:workspaceId/invitations",
    authenticate,
    checkWorkspacePermission([WorkSpaceMemberEnum.OWNER, WorkSpaceMemberEnum.MEMBER]),
    asyncHandler(memberController.getInvitations)
);

export const workSpaceMemberRouter = router;

