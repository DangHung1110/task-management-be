import { DataSource, Repository, LessThan } from "typeorm";
import { WorkspaceMembers, WorkspaceInvitation, InvitationStatus, WorkspaceMemberRole } from "../../../entities";
import { WorkSpaces } from "../../../entities";

export class WorkSpaceMemberRepository {
    private memberRepo: Repository<WorkspaceMembers>;
    private invitationRepo: Repository<WorkspaceInvitation>;
    private workspaceRepo: Repository<WorkSpaces>;

    constructor(ds: DataSource) {
        this.memberRepo = ds.getRepository(WorkspaceMembers);
        this.invitationRepo = ds.getRepository(WorkspaceInvitation);
        this.workspaceRepo = ds.getRepository(WorkSpaces);
    }

    // Workspace Member methods
    async findMemberByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMembers | null> {
        return this.memberRepo.findOne({
            where: {
                workspaceId,
                userId,
                isActive: true
            },
            relations: ["user", "workspace"]
        });
    }

    async findMembersByWorkspace(workspaceId: string): Promise<WorkspaceMembers[]> {
        return this.memberRepo.find({
            where: {
                workspaceId,
                isActive: true
            },
            relations: ["user"],
            order: {
                joinedAt: "DESC"
            }
        });
    }

    async createMember(data: {
        workspaceId: string;
        userId: string;
        role: WorkspaceMemberRole;
        invitedAt?: Date;
        joinedAt?: Date;
    }): Promise<WorkspaceMembers> {
        const member = this.memberRepo.create({
            workspaceId: data.workspaceId,
            userId: data.userId,
            role: data.role,
            isActive: true,
            invitedAt: data.invitedAt || null,
            joinedAt: data.joinedAt || new Date()
        });
        return this.memberRepo.save(member);
    }

    async updateMember(memberId: string, data: Partial<WorkspaceMembers>): Promise<WorkspaceMembers> {
        await this.memberRepo.update({ id: memberId }, data);
        const updated = await this.memberRepo.findOne({ where: { id: memberId }, relations: ["user"] });
        if (!updated) {
            throw new Error("Member not found after update");
        }
        return updated;
    }

    async removeMember(memberId: string): Promise<void> {
        await this.memberRepo.update({ id: memberId }, { isActive: false });
    }

    // Invitation methods
    async createInvitation(data: {
        workspaceId: string;
        email: string;
        token: string;
        invitedByUserId: string;
        userId?: string;
        expiresAt: Date;
    }): Promise<WorkspaceInvitation> {
        const invitation = this.invitationRepo.create({
            workspaceId: data.workspaceId,
            email: data.email,
            token: data.token,
            invitedByUserId: data.invitedByUserId,
            userId: data.userId || null,
            status: InvitationStatus.PENDING,
            expiresAt: data.expiresAt
        });
        return this.invitationRepo.save(invitation);
    }

    async findInvitationByToken(token: string): Promise<WorkspaceInvitation | null> {
        return this.invitationRepo.findOne({
            where: { token },
            relations: ["workspace", "workspace.owner", "invitedByUser", "user"]
        });
    }

    async findInvitationByEmailAndWorkspace(workspaceId: string, email: string): Promise<WorkspaceInvitation | null> {
        return this.invitationRepo.findOne({
            where: {
                workspaceId,
                email,
                status: InvitationStatus.PENDING
            },
            relations: ["workspace", "invitedByUser"]
        });
    }

    async findInvitationsByWorkspace(workspaceId: string): Promise<WorkspaceInvitation[]> {
        return this.invitationRepo.find({
            where: { workspaceId },
            relations: ["invitedByUser", "user"],
            order: {
                createdAt: "DESC"
            }
        });
    }

    async updateInvitationStatus(
        invitationId: string,
        status: InvitationStatus,
        userId?: string
    ): Promise<WorkspaceInvitation> {
        const updateData: Partial<WorkspaceInvitation> = {
            status,
            acceptedAt: status === InvitationStatus.ACCEPTED ? new Date() : null
        };
        
        if (userId && status === InvitationStatus.ACCEPTED) {
            updateData.userId = userId;
        }

        await this.invitationRepo.update({ id: invitationId }, updateData);
        const updated = await this.invitationRepo.findOne({
            where: { id: invitationId },
            relations: ["workspace", "invitedByUser", "user"]
        });
        
        if (!updated) {
            throw new Error("Invitation not found after update");
        }
        return updated;
    }

    async expireInvitations(): Promise<void> {
        await this.invitationRepo
            .createQueryBuilder()
            .update(WorkspaceInvitation)
            .set({ status: InvitationStatus.EXPIRED })
            .where("status = :status", { status: InvitationStatus.PENDING })
            .andWhere("expiresAt < :now", { now: new Date() })
            .execute();
    }
}

