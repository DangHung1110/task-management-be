import { WorkSpaces } from "../../../entities";
import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { paginationUtils, PaginationDto} from "../../../common";

export class WorkSpacesRepo {
    private repo: Repository<WorkSpaces>;
    private pagination: paginationUtils;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(WorkSpaces);
        this.pagination = new paginationUtils();
    }

    async getWorkSpaces(pagination: PaginationDto): Promise<{
        workSpaces: WorkSpaces[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(pagination);
        const query = this.repo.createQueryBuilder("workSpaces")
            .leftJoinAndSelect("workSpaces.owner", "owner")
            .leftJoinAndSelect("workSpaces.members", "members")
            .leftJoinAndSelect("members.user", "user")
            .skip(skip)
            .take(take)
            .orderBy("workSpaces.createdAt", "DESC");

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

    async createWorkSpace(data: Partial<WorkSpaces>): Promise<WorkSpaces> {
        const workSpace = this.repo.create(data);
        const saved = await this.repo.save(workSpace);
        return this.findWorkSpaceById(saved.id) as Promise<WorkSpaces>;
    }

    async updateWorkSpace(id: string, patch: Partial<WorkSpaces>): Promise<UpdateResult> {
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