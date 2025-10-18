import { WorkSpacesService } from "./workSpaces.service";
import { Request, Response } from "express";
import { HttpResponseDto } from "../../common";
import {
    GetWorkSpacesPaginationQueryDtoType,
    WorkSpacesListResponseType,
    WorkSpacesResponseType,
    workSpaceCreateRequestDto
} from "./dtos";

export class WorkSpacesController {
    constructor(private readonly workSpacesService: WorkSpacesService) {}

    async getWorkSpaces(req: Request): Promise<Response> {
        const queryData = req.query as GetWorkSpacesPaginationQueryDtoType;
        const result = await this.workSpacesService.getWorkSpaces(queryData);
        return new HttpResponseDto().success<WorkSpacesListResponseType>({ data: result });
    }

    async getWorkSpaceById(req: Request): Promise<Response> {
        const workSpace = await this.workSpacesService.getWorkSpaceByID(req.params.id);
        return new HttpResponseDto().success<WorkSpacesResponseType>({ data: workSpace });
    }

    async createWorkSpace(req: Request): Promise<Response> {
        const userId = (req as any).user?.id; 
        
        if (!userId) {
            throw new Error('User not authenticated');
        }

        const data = workSpaceCreateRequestDto.parse(req.body);
        const newWorkSpace = await this.workSpacesService.createWorkSpace(data, userId);
        return new HttpResponseDto().created<WorkSpacesResponseType>({ data: newWorkSpace });
    }

    async updateWorkSpace(req: Request): Promise<Response> {
        const updatedWorkSpace = await this.workSpacesService.updateWorkSpace(req.params.id, req.body);
        return new HttpResponseDto().success<WorkSpacesResponseType>({ data: updatedWorkSpace });
    }

    async shoftDeleteWorkSpace(req: Request): Promise<Response> {
        await this.workSpacesService.shoftDateleWorkSapce(req.params.id);
        return new HttpResponseDto().success<string>({ data: 'WorkSpace soft deleted successfully' });
    }

    async hardDeleteWorkSpace(req: Request): Promise<Response> {
        await this.workSpacesService.hardDeleteWorkSpace(req.params.id);
        return new HttpResponseDto().success<string>({ data: 'WorkSpace hard deleted successfully' });
    }

    async restoreWorkSpace(req: Request): Promise<Response> {
        await this.workSpacesService.restoreWorkSpace(req.params.id);
        return new HttpResponseDto().success<string>({ data: 'WorkSpace restored successfully' });
    }
}
