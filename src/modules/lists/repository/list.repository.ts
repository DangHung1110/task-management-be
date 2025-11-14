import { DataSource, Repository, In } from "typeorm";
import { List, Checklist, ChecklistItem } from "../../../entities"
import { NotFoundException, PaginationDto, paginationUtils } from "../../../common";

export class ListRepo { 
    private repo: Repository<List>;
    private pagination: paginationUtils;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(List);
        this.pagination = new paginationUtils();
    }

    async getLists(pagination: PaginationDto, userId: string, boardId: string, search?: string): Promise<{
        lists: List[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(pagination);
        const query = this.repo.createQueryBuilder("list")
            .leftJoinAndSelect("list.board", "board")
            .leftJoinAndSelect("board.members", "members")
            .leftJoinAndSelect("members.user", "memberUser")
            .skip(skip)
            .take(take)
            .where("list.isActive = :isActive", { isActive: true })
            .andWhere("list.boardId = :boardId", { boardId });

        if (search) {
            query.andWhere("list.name ILIKE :search", { search: `%${search}%` });
        }

        query.orderBy("list.position", "ASC");

        const [lists, total] = await query.getManyAndCount();
        const paginationInfo = this.pagination.convertToPaginationDto(total);
        return {
            lists,
            pagination: paginationInfo
        };
    }

    async findById(id: string): Promise<List | null> {
        return this.repo.findOne({
            where: { id, isActive: true },
            relations: ["board", "cards", "cards.checklists", "cards.checklists.items" ]
        })
    }

    async create(data: Partial<List>): Promise<List> {
        const list = this.repo.create(data);
        return this.repo.save(list);
    }

    async update(id: string, data: Partial<List>): Promise<List | null> {
        const list = await this.repo.findOne({ where: { id, isActive: true } });
        if (!list) {
            throw new NotFoundException('List not found');
        }
        Object.assign(list, data);
        return this.repo.save(list);
    }

    async softDelete(list: List): Promise<List> {
        list.isActive = false;
        return this.repo.save(list);
    }

    async hardDelete(list: List): Promise<void> {
        await this.repo.remove(list);
    }
    
    async restore(list: List): Promise<List> {
        list.isActive = true;
        return this.repo.save(list);
    }

    async getMaxPosition(boardId: string): Promise<number> {
        const result = await this.repo
            .createQueryBuilder("list")
            .select("MAX(list.position)", "max")
            .where("list.boardId = :boardId", { boardId })
            .andWhere("list.isActive = :isActive", { isActive: true })
            .getRawOne();
        
        return result?.max ?? 0;
    }

    async findListsByIds(firstId: string, secondId: string): Promise<{ first: List | null; second: List | null }> {
        const lists = await this.repo.find({
            where: { id: In([firstId, secondId]) }
        });
        const first = lists.find(l => l.id === firstId) || null;
        const second = lists.find(l => l.id === secondId) || null;
        return { first, second };
    }

    async swapPositions(firstList: List, secondList: List): Promise<void> {
        const tempPosition = firstList.position;
        firstList.position = secondList.position;
        secondList.position = tempPosition;
        
        await this.repo.save([firstList, secondList]);
    }
}
