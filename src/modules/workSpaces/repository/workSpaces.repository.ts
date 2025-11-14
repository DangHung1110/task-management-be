import { WorkSpaces, WorkspaceMembers } from "../../../entities";
import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { paginationUtils, PaginationDto} from "../../../common";
import { WorkspaceMemberRole } from "../../../entities";

export class WorkSpacesRepo {
    private repo: Repository<WorkSpaces>;
    private workspaceMemberRepo: Repository<WorkspaceMembers>;
    private pagination: paginationUtils;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(WorkSpaces);
        this.workspaceMemberRepo = ds.getRepository(WorkspaceMembers);
        this.pagination = new paginationUtils();
    }

    async getWorkSpaces(pagination: PaginationDto, userId?: string): Promise<{
        workSpaces: WorkSpaces[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(pagination);
        const query = this.repo.createQueryBuilder("workSpaces")
            .leftJoinAndSelect("workSpaces.owner", "owner")
            .leftJoinAndSelect("workSpaces.members", "members")
            .leftJoinAndSelect("members.user", "memberUser")
            .leftJoinAndSelect("workSpaces.boards", "boards")
            .skip(skip)
            .take(take)
            .orderBy("workSpaces.createdAt", "DESC");

        // Filter workspaces where user is a member (unless no userId provided - for admin)
        if (userId) {
            query.andWhere(
                "members.userId = :userId AND members.isActive = :isActive",
                { userId, isActive: true }
            );
        }

        if (pagination.search) {
            query.andWhere(
                "workSpaces.name ILIKE :search OR workSpaces.description ILIKE :search",
                { search: `%${pagination.search}%` }
            );
        }

        const [workSpaces, total] = await query.getManyAndCount();
        const paginationInfo = this.pagination.convertToPaginationDto(total);

        return { workSpaces, pagination: paginationInfo };
    }

    async findWorkSpaceById(id: string): Promise<WorkSpaces | null> {
        return this.repo.findOne({ 
            where: { id },
            relations: ['owner', 'members', 'members.user']
        });
    }

    async createWorkSpace(data: Partial<WorkSpaces>, ownerId: string): Promise<WorkSpaces> {
        const workSpace = this.repo.create(data);
        const saved = await this.repo.save(workSpace);
        
        const ownerMember = this.workspaceMemberRepo.create({
            workspaceId: saved.id,
            userId: ownerId,
            role: WorkspaceMemberRole.OWNER,
            isActive: true,
            joinedAt: new Date()
        });
        await this.workspaceMemberRepo.save(ownerMember);
        
        return this.findWorkSpaceById(saved.id) as Promise<WorkSpaces>;
    }

    async updateWorkSpace(id: string, patch: Partial<WorkSpaces>): Promise<UpdateResult> {
        console.log('Updating WorkSpace with data:', patch);
        return this.repo.update({ id }, patch);
    }

    async softDeleteWorkSpace(id: string): Promise<DeleteResult> {
        return this.repo.softDelete({ id });
    }

    async hardDeleteWorkSpace(id: string): Promise<DeleteResult> {
        return this.repo.delete({ id });
    }   

    async restoreWorkSpace(id: string): Promise<UpdateResult> {
        return this.repo.restore({ id });
    }
}