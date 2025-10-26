import { Request, Response } from 'express';
import { BoardService } from './board.service';
import {HttpResponseDto, NotFoundException, UnauthorizedException} from '../../common';
import {
    GetBoardsPaginationQueryDtoType,
    CreateBoardRequestDtoType,
    UpdateBoardRequestDtoType,
    BoardsListResponseType,
    BoardResponseType
} from './dtos';
import { Not } from 'typeorm';

export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    async getBoards(req: Request): Promise<Response> {
        const query = req.query as GetBoardsPaginationQueryDtoType;
        const userId = req.user?.id;
        const result = await this.boardService.getBoards(query, userId);

        return new HttpResponseDto().success<BoardsListResponseType>({ data: result });
    }

    async getBoardById(req: Request): Promise<Response> {
        const {id} = req.params;
        const userId = req.user?.id;
        const board = await this.boardService.getBoardById(id, userId);
        return new HttpResponseDto().success<BoardResponseType>({ data: board });
    }

    async createBoard(req: Request): Promise<Response> {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedException('User not authenticated');
        }
        const {workspaceId} = req.params;
        const data = req.body as CreateBoardRequestDtoType;
        const newBoard = await this.boardService.createBoard({...data, workspaceId}, userId);
        return new HttpResponseDto().created<BoardResponseType>({ data: newBoard });
    }

    async updateBoard(req: Request): Promise<Response> {
        const {id} = req.params;
        const userId = req.user?.id;
        const data = req.body as UpdateBoardRequestDtoType;
        const updatedBoard = await this.boardService.updateBoard(id, data, userId);
        return new HttpResponseDto().success<BoardResponseType>({ data: updatedBoard });
    }

    async softDeleteBoard(req: Request): Promise<Response> {
        const {id} = req.params;
        await this.boardService.softDeleteBoard(id);
        return new HttpResponseDto().success<string>({ data: 'Board soft deleted successfully' });
    }

    async hardDeleteBoard(req: Request): Promise<Response> {
        const {id} = req.params;
        await this.boardService.hardDeleteBoard(id);
        return new HttpResponseDto().success<string>({ data: 'Board hard deleted successfully' });
    }

    async restoreBoard(req: Request): Promise<Response> {
        const {id} = req.params;
        await this.boardService.restoreBoard(id);
        return new HttpResponseDto().success<string>({ data: 'Board restored successfully' });
    }
}