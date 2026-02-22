import { ListRepo } from "./repository";
import { List } from "../../entities";
import { BoardRepo } from "../board/repository";
import { NotFoundException, InternalServerException, BadRequestException } from "../../common";
import { cacheService } from "../../common/cache/cache.service";
import { CACHE_CONFIG } from "../../config/cache.config";
import {
    createListRequestDto,
    CreateListRequestDtoType,
    updateListRequestDto,
    UpdateListRequestDtoType,
    getListpagiantionRequestDto,
    GetListPaginationRequestDtoType,
    getListsResponseSchema,
    GetListsResponseType
} from "./dtos";

export class ListService {
    constructor(private readonly listRepo: ListRepo, private readonly boardRepo: BoardRepo) {}

    async getLists(query: GetListPaginationRequestDtoType, userId: string): Promise<GetListsResponseType> {
        const paginationInput = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 10,
            search: query.search,
            total: undefined,
            boardId: query.boardId,
        };

        const { lists, pagination: paginationInfo }  = await this.listRepo.getLists(paginationInput, userId, query.boardId || '', query.search);
        return getListsResponseSchema.parse({
            data: lists,
            pagination: paginationInfo
        });
    }

    async getListById(id: string): Promise<List> {
        const cacheKey = CACHE_CONFIG.keys.list(id);
        
        const cached = await cacheService.get<List>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const list = await this.listRepo.findById(id);
        if (!list) {
            throw new NotFoundException('List not found');
        }
        
        await cacheService.set(cacheKey, list, {
            ttl: CACHE_CONFIG.ttl.listData
        });

        return list;
    }

    async createList(boardId: string, dto: CreateListRequestDtoType): Promise<List> {
        const board = await this.boardRepo.findBoardById(boardId);
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        // Get max position and add 1 for new list
        const maxPosition = await this.listRepo.getMaxPosition(boardId);
        const newPosition = maxPosition + 1;

        const list = new List();
        list.boardId = boardId;
        list.name = dto.name;
        list.position = newPosition;

        const createdList = await this.listRepo.create(list);
        if (!createdList) {
            throw new InternalServerException('Failed to create list');
        }
        
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${boardId}:*`);

        return createdList;
    }

    async updatelist(id: string, data: UpdateListRequestDtoType): Promise<List> {
        const list = await this.listRepo.findById(id);
        if (!list) {
            throw new NotFoundException('List not found');
        }

        if (data.isArchived !== undefined) {
            if (data.isArchived && !list.isArchived) {
                list.isArchived = true;
                list.archivedAt = new Date();
            } else if (!data.isArchived && list.isArchived) {
                list.isArchived = false;
                list.archivedAt = null;
            }
        }

        await this.listRepo.update(id, data);
        const updatedList = await this.listRepo.findById(id);
        if (!updatedList) {
            throw new InternalServerException('Failed to update list');
        }
        
        await cacheService.delete(CACHE_CONFIG.keys.list(id));
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${list.boardId}:*`);

        return updatedList;
    }
    async softDeleteList(id: string): Promise<void> {
        const list = await this.listRepo.findById(id);
        
        if (!list) {
            throw new NotFoundException('List not found');
        }

        await this.listRepo.softDelete(list);
        
        await cacheService.delete(CACHE_CONFIG.keys.list(id));
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${list.boardId}:*`);
    }

    async hardDeleteList(id: string): Promise<void> {
        const list = await this.listRepo.findById(id);

        if (!list) {
            throw new NotFoundException('List not found');
        }

        await this.listRepo.hardDelete(list);
        
        await cacheService.delete(CACHE_CONFIG.keys.list(id));
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${list.boardId}:*`);
    }

    async restoreList(id: string): Promise<void> {
        const list = await this.listRepo.findById(id);

        if (!list) {
            throw new NotFoundException('List not found');
        }

        await this.listRepo.restore(list);
        
        await cacheService.delete(CACHE_CONFIG.keys.list(id));
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${list.boardId}:*`);
    }

    async swapListPosition(firstListId: string, secondListId: string): Promise<void> {
        if (firstListId === secondListId) {
            throw new BadRequestException('Cannot swap a list with itself');
        }

        const { first, second } = await this.listRepo.findListsByIds(firstListId, secondListId);
        
        if (!first || !second) {
            throw new NotFoundException('One or both lists not found');
        }

        if (first.boardId !== second.boardId) {
            throw new BadRequestException('Cannot swap lists from different boards');
        }

        if (!first.isActive || !second.isActive) {
            throw new BadRequestException('Cannot swap inactive lists');
        }

        await this.listRepo.swapPositions(first, second);
        
        await cacheService.delete(CACHE_CONFIG.keys.list(firstListId));
        await cacheService.delete(CACHE_CONFIG.keys.list(secondListId));
        await cacheService.deletePattern(`list:*`);
        await cacheService.deletePattern(`board:${first.boardId}:*`);
    }
}