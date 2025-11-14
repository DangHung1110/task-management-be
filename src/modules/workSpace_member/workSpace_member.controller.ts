import { WorkSpaceMemberService } from "./workSpace_member.service";
import { Request, Response } from "express";
import { HttpResponseDto } from "../../common";
import {
    InviteMemberRequestType,
    AcceptInvitationRequestType,
    InvitationResponseType,
    MemberResponseType
} from "./dtos";
import { inviteMemberRequestSchema, acceptInvitationRequestSchema } from "./dtos";

export class WorkSpaceMemberController {
    constructor(private readonly memberService: WorkSpaceMemberService) {}

    async inviteMember(req: Request): Promise<Response> {
        const userId = (req as any).user?.id;
        const workspaceId = req.params.workspaceId;
        
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const data = inviteMemberRequestSchema.parse(req.body);
        const invitation = await this.memberService.inviteMember(
            workspaceId,
            userId,
            data
        );

        return new HttpResponseDto().created<InvitationResponseType>({
            data: invitation
        });
    }

    async acceptInvitation(req: Request): Promise<Response> {
        const userId = (req as any).user?.id;
        
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const data = acceptInvitationRequestSchema.parse(req.body);
        const member = await this.memberService.acceptInvitation(
            data.token,
            userId
        );

        return new HttpResponseDto().success<MemberResponseType>({
            data: member
        });
    }

    async getInvitations(req: Request): Promise<Response> {
        const userId = (req as any).user?.id;
        const workspaceId = req.params.workspaceId;
        
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const invitations = await this.memberService.getInvitations(
            workspaceId,
            userId
        );

        return new HttpResponseDto().success<InvitationResponseType[]>({
            data: invitations
        });
    }
}

