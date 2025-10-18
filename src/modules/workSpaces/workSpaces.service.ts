import { WorkSpacesRepo } from "./repository";
import { WorkSpaces } from "../../entities";
import { NotFoundException, InternalServerException } from "../../common";
import {
    GetWorkSpacesPaginationQueryDtoType,
    WorkSpacesListResponseSchema,
    WorkSpacesListResponseType,
    WorkSpacesResponseType,
    WorkSpaceCreateRequestDtoType
} from "./dtos";

export class WorkSpacesService {
    constructor(
        private readonly workSpacesRepo: WorkSpacesRepo
    ) {}

    private transformWorkSpaceToResponse(workSpace: WorkSpaces): WorkSpacesResponseType {
        return {
            id: workSpace.id,
            name: workSpace.name,
            description: workSpace.description,
            owner: {
                id: workSpace.owner.id,
                name: workSpace.owner.name
            },
            members: workSpace.members
                ?.filter(member => member.role !== 'owner')
                .map(member => ({
                    id: member.user.id,
                    name: member.user.name,
                    role: member.role as 'admin' | 'member',
                    joinedAt: member.joinedAt
                })) || [],
            isActive: workSpace.isActive,
            createdAt: workSpace.createdAt,
            updatedAt: workSpace.updatedAt
        };
    }

    async getWorkSpaces(query: GetWorkSpacesPaginationQueryDtoType): Promise<WorkSpacesListResponseType> {
        const paginationInput = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 5,
            search: query.search,
            total: undefined 
        };

        const { workSpaces, pagination: paginationInfo } = await this.workSpacesRepo.getWorkSpaces(paginationInput);
        
        if (!workSpaces || workSpaces.length === 0) {
            throw new NotFoundException('WorkSpaces not found');
        }

        const transformedData = workSpaces.map(ws => this.transformWorkSpaceToResponse(ws));

        const result = WorkSpacesListResponseSchema.parse({
            data: transformedData,
            pagination: paginationInfo
        });

        return result;
    }

    async getWorkSpaceByID(id: string): Promise<WorkSpacesResponseType> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        return this.transformWorkSpaceToResponse(workSpace);
    }

    async createWorkSpace(data: WorkSpaceCreateRequestDtoType, ownerId: string): Promise<WorkSpacesResponseType> {
        const workSpaceData: Partial<WorkSpaces> = {
            ...data,
            ownerId: ownerId,
        };
        
        const newWorkSpace = await this.workSpacesRepo.createWorkSpace(workSpaceData);
        if (!newWorkSpace) {
            throw new InternalServerException('Failed to create WorkSpace');
        }
        return this.transformWorkSpaceToResponse(newWorkSpace);
    }

    async updateWorkSpace(id: string, data: Partial<WorkSpaces>): Promise<WorkSpacesResponseType> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }

        await this.workSpacesRepo.updateWorkSpace(id, data);
        const updatedWorkSpace = await this.workSpacesRepo.findWorkSpaceById(id);   
        if (!updatedWorkSpace) {
            throw new InternalServerException('Failed to retrieve updated WorkSpace');
        }
        return this.transformWorkSpaceToResponse(updatedWorkSpace);
    }

    async shoftDateleWorkSapce(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        await this.workSpacesRepo.softDeleteWorkSpace(id);
    }

    async hardDeleteWorkSpace(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        await this.workSpacesRepo.hardDeleteWorkSpace(id);
    }

    async restoreWorkSpace(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        await this.workSpacesRepo.restoreWorkSpace(id);
    
    }}