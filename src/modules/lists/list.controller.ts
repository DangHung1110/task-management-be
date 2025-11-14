import { Request, Response } from "express";
import { HttpResponseDto } from "../../common";
import { ListService } from "./list.service";
import {
    createListRequestDto,
    updateListRequestDto,
    swapListPositionRequestDto,
    getListpagiantionRequestDto,
    CreateListRequestDtoType,
    UpdateListRequestDtoType,
    SwapListPositionRequestDtoType,
    GetListPaginationRequestDtoType,
} from "./dtos";
import { GetListResponseType } from "./dtos";

export class ListController {
    constructor(private readonly listService: ListService) {}

    async getLists(req: Request): Promise<Response> {
        const userId = (req as any).user?.id;
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const query = getListpagiantionRequestDto.parse(req.query);
        const result = await this.listService.getLists(query, userId);
        
        return new HttpResponseDto().success(result);
    }

    async getListById(req: Request): Promise<Response> {
        const { id } = req.params;
        const list = await this.listService.getListById(id);
        
        return new HttpResponseDto().success<GetListResponseType>({
            data: list as any
        });
    }

    async createList(req: Request): Promise<Response> {
        const { boardId } = req.params;
        const data = createListRequestDto.parse(req.body);
        
        const list = await this.listService.createList(boardId, data);
        
        return new HttpResponseDto().created<GetListResponseType>({
            data: list as any
        });
    }

    async updateList(req: Request): Promise<Response> {
        const { id } = req.params;
        const data = updateListRequestDto.parse(req.body);
        
        const list = await this.listService.updatelist(id, data);
        
        return new HttpResponseDto().success<GetListResponseType>({
            data: list as any
        });
    }

    async deleteList(req: Request): Promise<Response> {
        const { id } = req.params;
        await this.listService.softDeleteList(id);
        
        return new HttpResponseDto().success({
            data: { message: "List deleted successfully" }
        });
    }

    async hardDeleteList(req: Request): Promise<Response> {
        const { id } = req.params;
        await this.listService.hardDeleteList(id);
        
        return new HttpResponseDto().success({
            data: { message: "List permanently deleted successfully" }
        });
    }

    async restoreList(req: Request): Promise<Response> {
        const { id } = req.params;
        await this.listService.restoreList(id);
        
        return new HttpResponseDto().success({
            data: { message: "List restored successfully" }
        });
    }

    async swapListPosition(req: Request): Promise<Response> {
        const data = swapListPositionRequestDto.parse(req.body);
        await this.listService.swapListPosition(data.firstListId, data.secondListId);
        
        return new HttpResponseDto().success({
            data: { message: "List positions swapped successfully" }
        });
    }
}

