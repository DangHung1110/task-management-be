import { WorkSpaceMemberRepository } from "./repository/workSpace_member.repository";
import { 
    NotFoundException, 
    ConflictException, 
    BadRequestException,
    ForbiddenException
} from "../../common";
import { AppDataSource } from "../../config";
import { User, WorkspaceMemberRole, InvitationStatus, WorkSpaces } from "../../entities";
import { InviteMemberRequestType, AcceptInvitationRequestType, InvitationResponseType, MemberResponseType } from "./dtos";
import { transporter, emailTemplates } from "../../config/mail.config";
import crypto from "crypto";

export class WorkSpaceMemberService {
    constructor(
        private readonly memberRepo: WorkSpaceMemberRepository
    ) {}

    /**
     * Mời người khác vào workspace qua email
     */
    async inviteMember(
        workspaceId: string, 
        invitedByUserId: string,
        data: InviteMemberRequestType
    ): Promise<InvitationResponseType> {
        // Kiểm tra workspace có tồn tại không
        const workspaceRepo = AppDataSource.getRepository(WorkSpaces);
        const workspace = await workspaceRepo.findOne({
            where: { id: workspaceId },
            relations: ["owner"]
        });

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        // Kiểm tra người mời có phải owner hoặc member không
        const inviterMember = await this.memberRepo.findMemberByWorkspaceAndUser(
            workspaceId,
            invitedByUserId
        );

        if (!inviterMember && workspace.ownerId !== invitedByUserId) {
            throw new ForbiddenException("You don't have permission to invite members to this workspace");
        }

        // Tìm user theo email
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { email: data.email } });

        // Kiểm tra xem user đã là member chưa
        if (user) {
            const existingMember = await this.memberRepo.findMemberByWorkspaceAndUser(
                workspaceId,
                user.id
            );

            if (existingMember) {
                throw new ConflictException("User is already a member of this workspace");
            }
        }

        // Kiểm tra xem đã có invitation pending chưa
        const existingInvitation = await this.memberRepo.findInvitationByEmailAndWorkspace(
            workspaceId,
            data.email
        );

        if (existingInvitation) {
            throw new ConflictException("An invitation has already been sent to this email");
        }

        // Tạo token cho invitation
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

        // Tạo invitation
        const invitation = await this.memberRepo.createInvitation({
            workspaceId,
            email: data.email,
            token,
            invitedByUserId,
            userId: user?.id,
            expiresAt
        });

        // Gửi email invitation
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const invitationLink = `${frontendUrl}/workspace/invitation/accept?token=${invitation.token}`;
        
        const emailTemplate = emailTemplates.workspaceInvitation(
            user?.name || invitation.email.split('@')[0],
            workspace.name,
            invitationLink,
            invitation.expiresAt
        );

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: invitation.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        });

        return {
            id: invitation.id,
            email: invitation.email,
            workspaceId: invitation.workspaceId,
            workspaceName: workspace.name,
            status: invitation.status,
            invitedBy: invitation.invitedByUser ? {
                id: invitation.invitedByUser.id,
                name: invitation.invitedByUser.name
            } : null,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt
        };
    }

    /**
     * Chấp nhận invitation
     */
    async acceptInvitation(
        token: string,
        userId: string
    ): Promise<MemberResponseType> {
        // Tìm invitation theo token
        const invitation = await this.memberRepo.findInvitationByToken(token);

        if (!invitation) {
            throw new NotFoundException("Invitation not found");
        }

        // Kiểm tra status
        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException(`Invitation has been ${invitation.status}`);
        }

        // Kiểm tra expiry
        if (new Date() > invitation.expiresAt) {
            await this.memberRepo.updateInvitationStatus(
                invitation.id,
                InvitationStatus.EXPIRED
            );
            throw new BadRequestException("Invitation has expired");
        }

        // Kiểm tra email khớp với user
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.email !== invitation.email) {
            throw new ForbiddenException("This invitation is not for your email address");
        }

        // Kiểm tra xem đã là member chưa
        const existingMember = await this.memberRepo.findMemberByWorkspaceAndUser(
            invitation.workspaceId,
            userId
        );

        if (existingMember) {
            // Update invitation status anyway
            await this.memberRepo.updateInvitationStatus(
                invitation.id,
                InvitationStatus.ACCEPTED,
                userId
            );
            throw new ConflictException("You are already a member of this workspace");
        }

        // Tạo member
        const member = await this.memberRepo.createMember({
            workspaceId: invitation.workspaceId,
            userId,
            role: WorkspaceMemberRole.MEMBER,
            invitedAt: invitation.createdAt,
            joinedAt: new Date()
        });

        // Update invitation status
        await this.memberRepo.updateInvitationStatus(
            invitation.id,
            InvitationStatus.ACCEPTED,
            userId
        );

        return {
            id: member.id,
            userId: member.userId,
            user: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email
            },
            role: member.role,
            isActive: member.isActive,
            invitedAt: member.invitedAt,
            joinedAt: member.joinedAt
        };
    }

    /**
     * Lấy danh sách invitations của workspace
     */
    async getInvitations(workspaceId: string, userId: string): Promise<InvitationResponseType[]> {
        // Kiểm tra user có quyền xem invitations không
        const member = await this.memberRepo.findMemberByWorkspaceAndUser(workspaceId, userId);
        const workspaceRepo = AppDataSource.getRepository(WorkSpaces);
        const workspace = await workspaceRepo.findOne({ where: { id: workspaceId } });

        if (!member && workspace?.ownerId !== userId) {
            throw new ForbiddenException("You don't have permission to view invitations");
        }

        const invitations = await this.memberRepo.findInvitationsByWorkspace(workspaceId);

        return invitations.map(inv => ({
            id: inv.id,
            email: inv.email,
            workspaceId: inv.workspaceId,
            workspaceName: inv.workspace.name,
            status: inv.status,
            invitedBy: inv.invitedByUser ? {
                id: inv.invitedByUser.id,
                name: inv.invitedByUser.name
            } : null,
            expiresAt: inv.expiresAt,
            createdAt: inv.createdAt
        }));
    }

}

