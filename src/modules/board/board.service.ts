import { BoardRepo } from "./repository";
import { Board } from "../../entities";
import { WorkSpacesRepo } from "../workSpaces/repository";
import { NotFoundException, InternalServerException } from "../../common";
import { cacheService } from "../../common/cache/cache.service";
import { CACHE_CONFIG } from "../../config/cache.config";
import {
    GetBoardsPaginationQueryDtoType,
    BoardsListResponseType,
    BoardResponseType,
    CreateBoardRequestDtoType,
    UpdateBoardRequestDtoType,
    listBoardsResponseSchema,
} from "./dtos";

export class BoardService {
    constructor(private readonly boardRepo: BoardRepo, private readonly workSpacesRepo: WorkSpacesRepo) {

    }

    private transformBoardToResponse(board: Board, currentUserId?: string): BoardResponseType {
        let userRole: 'owner' | 'admin' | 'member' | undefined;
        if (currentUserId) {
            const membership = board.members?.find(m => m.userId === currentUserId);
            userRole = membership?.role as 'owner' | 'admin' | 'member';
        }
        return {
            id: board.id,
            name: board.name,
            description: board.description || '',
            workSpaceId: board.workspaceId,
            workSpace: {
                id: board.workspace.id,
                name: board.workspace.name,
            },
            owner: {
                id: board.owner.id,
                name: board.owner.name,
            },
            member: board.members
                ?.filter(member => member.role !== 'owner')
                .map(member => ({
                    id: member.user.id,
                    name: member.user.name,
                    role: member.role as 'admin' | 'member',
                    joinedAt: member.joinedAt,
                })) || [],
            visibility: board.visibility,
            isActive: board.isActive,
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
        };
    }

    async getBoards(query: GetBoardsPaginationQueryDtoType, userId?: string): Promise<BoardsListResponseType> {
        const paginationInput = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 10,
            search: query.search,
            total: undefined,
            workspaceId: query.workspaceId,
        };

        const { boards, pagination: paginationInfo } = await this.boardRepo.getBoards(paginationInput, userId);

        const transformedData = boards.map(board => this.transformBoardToResponse(board, userId));

        return listBoardsResponseSchema.parse({
            data: transformedData,
            pagination: paginationInfo,
        });
    }

    async getBoardById(id: string, userId?: string): Promise<BoardResponseType> {
        const cacheKey = CACHE_CONFIG.keys.board(id);
        
        const cached = await cacheService.get<BoardResponseType>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const board = await this.boardRepo.findBoardById(id);
        if (!board) {
            throw new NotFoundException('Board not found');
        }
        
        const result = this.transformBoardToResponse(board, userId);
        
        await cacheService.set(cacheKey, result, {
            ttl: CACHE_CONFIG.ttl.boardData
        });
        
        return result;
    }

    async createBoard(data: CreateBoardRequestDtoType & { workspaceId: string }, ownerId: string): Promise<BoardResponseType> {
        
        await cacheService.deletePattern(`board:*`);
        await cacheService.deletePattern(`workspace:${data.workspaceId}:*`);
        
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(data.workspaceId)
        if (!workSpace) {
            throw new NotFoundException('Workspace not found for the board');
        }

        const boardData: Partial<Board> = {
            ...data,
            ownerId,
        };

        const newBoard = await this.boardRepo.createBoard(boardData, ownerId);
        if (!newBoard) {
            throw new InternalServerException('Failed to create board');
        }
        return this.transformBoardToResponse(newBoard, ownerId);
    }

    async updateBoard(id: string, data: UpdateBoardRequestDtoType, userId?: string): Promise<BoardResponseType> {
        const board = await this.boardRepo.findBoardById(id);
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        await this.boardRepo.updateBoard(id, data);
        
        await cacheService.delete(CACHE_CONFIG.keys.board(id));
        await cacheService.deletePattern(`board:*`);
        await cacheService.deletePattern(`workspace:${board.workspaceId}:*`);
        
        const updatedBoard = await this.boardRepo.findBoardById(id);
        if (!updatedBoard) {
            throw new InternalServerException('Failed to retrieve updated board');
        }
        
        await cacheService.delete(CACHE_CONFIG.keys.board(id));
        await cacheService.deletePattern(`board:*`);
        await cacheService.deletePattern(`workspace:${board.workspaceId}:*`);
        return this.transformBoardToResponse(updatedBoard, userId);
    }

    async softDeleteBoard(id: string): Promise<void> {
        const board = await this.boardRepo.findBoardById(id);
        if (!board) {
            throw new NotFoundException('Board not found');
        }
        
        await cacheService.delete(CACHE_CONFIG.keys.board(id));
        await cacheService.deletePattern(`board:*`);
        await cacheService.deletePattern(`workspace:${board.workspaceId}:*`);
        await this.boardRepo.softDeleteBoard(id);
    }

    async hardDeleteBoard(id: string): Promise<void> {
        
        await cacheService.delete(CACHE_CONFIG.keys.board(id));
        await cacheService.deletePattern(`board:*`);
        await cacheService.deletePattern(`workspace:${board.workspaceId}:*`);
        const board = await this.boardRepo.findBoardById(id);
        if (!board) {
            throw new NotFoundException('Board not found');
        }
        await this.boardRepo.hardDeleteBoard(id);
    }

    async restoreBoard(id: string): Promise<void> {
        const board = await this.boardRepo.findBoardById(id);
        if (!board) {
            throw new NotFoundException('Board not found');
        }
        await this.boardRepo.restoreBoard(id);
    }
}