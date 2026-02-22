import { WorkSpacesRepo } from "./repository";
import { WorkSpaces } from "../../entities";
import { NotFoundException, InternalServerException } from "../../common";
import { cacheService } from "../../common/cache/cache.service";
import { CACHE_CONFIG } from "../../config/cache.config";
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

    private transformWorkSpaceToResponse(workSpace: WorkSpaces, currentUserId?: string): WorkSpacesResponseType {
        let userRole: 'owner' | 'member' | undefined;
        if (currentUserId) {
            const membership = workSpace.members?.find(m => m.userId === currentUserId);
            userRole = membership?.role as 'owner' | 'member'; 
        }

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
                    role: member.role as 'member', 
                    joinedAt: member.joinedAt
                })) || [],
            userRole,
            isActive: workSpace.isActive,
            createdAt: workSpace.createdAt,
            updatedAt: workSpace.updatedAt
        };
    }

    async getWorkSpaces(query: GetWorkSpacesPaginationQueryDtoType, userId?: string): Promise<WorkSpacesListResponseType> {
        const paginationInput = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 5,
            search: query.search,
            total: undefined 
        };

        const { workSpaces, pagination: paginationInfo } = await this.workSpacesRepo.getWorkSpaces(paginationInput, userId);
        
        if (!workSpaces || workSpaces.length === 0) {
            throw new NotFoundException('WorkSpaces not found');
        }

        const transformedData = workSpaces.map(ws => this.transformWorkSpaceToResponse(ws, userId));

        const result = WorkSpacesListResponseSchema.parse({
            data: transformedData,
            pagination: paginationInfo
        });

        return result;
    }

    async getWorkSpaceByID(id: string, userId?: string): Promise<WorkSpacesResponseType> {
        const cacheKey = CACHE_CONFIG.keys.workspace(id);
        
        const cached = await cacheService.get<WorkSpacesResponseType>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        
        const result = this.transformWorkSpaceToResponse(workSpace, userId);
        
        await cacheService.set(cacheKey, result, {
            ttl: CACHE_CONFIG.ttl.workspaceData
        });
        
        return result;
    }

    async createWorkSpace(data: WorkSpaceCreateRequestDtoType, ownerId: string): Promise<WorkSpacesResponseType> {
        const workSpaceData: Partial<WorkSpaces> = {
            ...data,
            ownerId: ownerId,
        };
        
        const newWorkSpace = await this.workSpacesRepo.createWorkSpace(workSpaceData, ownerId);
        if (!newWorkSpace) {
            throw new InternalServerException('Failed to create WorkSpace');
        }
        
        await cacheService.deletePattern(`workspace:*`);
        
        return this.transformWorkSpaceToResponse(newWorkSpace, ownerId);
    }

    async updateWorkSpace(id: string, data: Partial<WorkSpaces>, userId?: string): Promise<WorkSpacesResponseType> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }

        await this.workSpacesRepo.updateWorkSpace(id, data);
        const updatedWorkSpace = await this.workSpacesRepo.findWorkSpaceById(id);   
        
        await cacheService.delete(CACHE_CONFIG.keys.workspace(id));
        await cacheService.deletePattern(`workspace:*`);
        
        if (!updatedWorkSpace) {
            throw new InternalServerException('Failed to retrieve updated WorkSpace');
        }
        return this.transformWorkSpaceToResponse(updatedWorkSpace, userId);
    }
    
        await cacheService.delete(CACHE_CONFIG.keys.workspace(id));
        await cacheService.deletePattern(`workspace:*`);
    
    async shoftDateleWorkSapce(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        await this.workSpacesRepo.softDeleteWorkSpace(id);
    }
    
        await cacheService.delete(CACHE_CONFIG.keys.workspace(id));
        await cacheService.deletePattern(`workspace:*`);
    
    async hardDeleteWorkSpace(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        
        await cacheService.delete(CACHE_CONFIG.keys.workspace(id));
        await cacheService.deletePattern(`workspace:*`);    }
        await this.workSpacesRepo.hardDeleteWorkSpace(id);
    }

    async restoreWorkSpace(id: string): Promise<void> {
        const workSpace = await this.workSpacesRepo.findWorkSpaceById(id);
        if (!workSpace) {
            throw new NotFoundException('WorkSpace not found');
        }
        await this.workSpacesRepo.restoreWorkSpace(id);
    
    }}