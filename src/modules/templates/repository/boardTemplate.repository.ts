import { Repository, DataSource } from "typeorm";
import { BoardTemplate, ListTemplate, CardTemplate } from "../../../entities";
import { PaginationDto, paginationUtils } from "../../../common";
import { BoardTemplatePaginationRequestDtoType } from "../dtos";

export class BoardTemplateRepo {
    private repo: Repository<BoardTemplate>;
    private listTemplateRepo: Repository<ListTemplate>;
    private cardTemplateRepo: Repository<CardTemplate>;
    private pagination: paginationUtils;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(BoardTemplate);
        this.listTemplateRepo = ds.getRepository(ListTemplate);
        this.cardTemplateRepo = ds.getRepository(CardTemplate);
        this.pagination = new paginationUtils();
    }

    async getBoardTemplates(
        paginationDto: PaginationDto,
        filters: BoardTemplatePaginationRequestDtoType,
        userId?: string
    ): Promise<{
        templates: BoardTemplate[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(paginationDto);
        const query = this.repo.createQueryBuilder("template")
            .leftJoinAndSelect("template.creator", "creator")
            .leftJoinAndSelect("template.workspace", "workspace")
            .leftJoinAndSelect("template.listTemplates", "listTemplates")
            .leftJoinAndSelect("listTemplates.cardTemplates", "cardTemplates")
            .where("template.isActive = :isActive", { isActive: true })
            .orderBy("template.usageCount", "DESC")
            .addOrderBy("template.createdAt", "DESC")
            .skip(skip)
            .take(take);

        if (filters.visibility) {
            query.andWhere("template.visibility = :visibility", { visibility: filters.visibility });
        } else if (userId) {
            query.andWhere(
                "(template.visibility = 'system' OR template.visibility = 'public' OR (template.visibility = 'private' AND template.creatorId = :userId))",
                { userId }
            );
        } else {
            query.andWhere("template.visibility IN ('system', 'public')");
        }

        if (filters.category) {
            query.andWhere("template.category = :category", { category: filters.category });
        }

        if (filters.workspaceId) {
            query.andWhere("template.workspaceId = :workspaceId", { workspaceId: filters.workspaceId });
        }

        if (filters.isSystem !== undefined) {
            query.andWhere("template.isSystem = :isSystem", { isSystem: filters.isSystem });
        }

        if (filters.search) {
            query.andWhere(
                "(template.name ILIKE :search OR template.description ILIKE :search)",
                { search: `%${filters.search}%` }
            );
        }

        const [templates, total] = await query.getManyAndCount();
        const paginationInfo = this.pagination.convertToPaginationDto(total);

        return {
            templates,
            pagination: paginationInfo,
        };
    }

    async findTemplateById(id: string, userId?: string): Promise<BoardTemplate | null> {
        const query = this.repo.createQueryBuilder("template")
            .leftJoinAndSelect("template.creator", "creator")
            .leftJoinAndSelect("template.workspace", "workspace")
            .leftJoinAndSelect("template.listTemplates", "listTemplates")
            .leftJoinAndSelect("listTemplates.cardTemplates", "cardTemplates")
            .where("template.id = :id", { id })
            .andWhere("template.isActive = :isActive", { isActive: true });

        if (userId) {
            query.andWhere(
                "(template.visibility = 'system' OR template.visibility = 'public' OR (template.visibility = 'private' AND template.creatorId = :userId))",
                { userId }
            );
        } else {
            query.andWhere("template.visibility IN ('system', 'public')");
        }

        return query.getOne();
    }

    async createBoardTemplate(data: Partial<BoardTemplate>, userId?: string): Promise<BoardTemplate> {
        const template = this.repo.create({
            ...data,
            creatorId: userId || null,
            isSystem: false,
        });

        return this.repo.save(template);
    }

    async updateBoardTemplate(id: string, data: Partial<BoardTemplate>): Promise<void> {
        await this.repo.update(id, data);
    }

    async deleteBoardTemplate(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }

    async incrementUsageCount(id: string): Promise<void> {
        await this.repo.increment({ id }, "usageCount", 1);
    }

    async createListTemplate(data: Partial<ListTemplate>): Promise<ListTemplate> {
        const listTemplate = this.listTemplateRepo.create(data);
        return this.listTemplateRepo.save(listTemplate);
    }

    async createCardTemplate(data: Partial<CardTemplate>): Promise<CardTemplate> {
        const cardTemplate = this.cardTemplateRepo.create(data);
        return this.cardTemplateRepo.save(cardTemplate);
    }

    async deleteListTemplatesByBoardTemplateId(boardTemplateId: string): Promise<void> {
        await this.listTemplateRepo.delete({ boardTemplateId });
    }
}
