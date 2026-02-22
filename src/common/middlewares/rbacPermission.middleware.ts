import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { WorkspaceMembers, BoardMember, List, Card } from "../../entities";
import { rbacCacheService } from "../cache/strategies/rbac.cache";

export async function clearPermissionsCache() {
    await rbacCacheService.invalidateAll();
}

export const requireWorkspacePermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const { workspaceId } = req.params;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!workspaceId) {
                throw new ForbiddenException("Workspace ID is required");
            }

            const isSystemAdmin = user.roles?.includes("admin");
            if (isSystemAdmin) {
                return next();
            }

            const workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMembers);
            const membership = await workspaceMemberRepo.findOne({
                where: {
                    workspaceId,
                    userId: user.id,
                    isActive: true
                }
            });

            if (!membership) {
                throw new ForbiddenException("You are not a member of this workspace");
            }

            const hasAccess = await rbacCacheService.getPermission('workspace', membership.role, permissionName);
            
            if (hasAccess === null) {
                throw new ForbiddenException(`Permission '${permissionName}' not found in system`);
            }
            
            if (!hasAccess) {
                throw new ForbiddenException(
                    `Permission denied: Your role '${membership.role}' does not have permission '${permissionName}'`
                );
            }

            (req as any).workspaceMembership = membership;
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireBoardPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const { boardId } = req.params;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!boardId) {
                throw new ForbiddenException("Board ID is required");
            }

            const isSystemAdmin = user.roles?.includes("admin");
            if (isSystemAdmin) {
                return next();
            }

            const boardMemberRepo = AppDataSource.getRepository(BoardMember);
            const membership = await boardMemberRepo.findOne({
                where: {
                    boardId,
                    userId: user.id,
                    isActive: true
                }
            });

            if (!membership) {
                throw new ForbiddenException("You are not a member of this board");
            }

            const hasAccess = await rbacCacheService.getPermission('board', membership.role, permissionName);
            
            if (hasAccess === null) {
                throw new ForbiddenException(`Permission '${permissionName}' not found in system`);
            }
            
            if (!hasAccess) {
                throw new ForbiddenException(
                    `Permission denied: Your role '${membership.role}' does not have permission '${permissionName}'`
                );
            }

            (req as any).boardMembership = membership;
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireBoardPermissionViaList = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const listId = req.params.listId || req.params.id || req.body.firstListId || req.body.secondListId;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!listId) {
                throw new ForbiddenException("List ID is required");
            }

            const isSystemAdmin = user.roles?.includes("admin");
            if (isSystemAdmin) {
                return next();
            }

            const listRepo = AppDataSource.getRepository(List);
            const list = await listRepo.findOne({ 
                where: { id: listId, isActive: true }
            });

            if (!list) {
                throw new ForbiddenException("List not found or inactive");
            }

            const boardMemberRepo = AppDataSource.getRepository(BoardMember);
            const membership = await boardMemberRepo.findOne({
                where: {
                    boardId: list.boardId,
                    userId: user.id,
                    isActive: true
                }
            });

            if (!membership) {
                throw new ForbiddenException("You are not a member of this board");
            }

            const hasAccess = await rbacCacheService.getPermission('board', membership.role, permissionName);
            
            if (hasAccess === null) {
                throw new ForbiddenException(`Permission '${permissionName}' not found in system`);
            }
            
            if (!hasAccess) {
                throw new ForbiddenException(
                    `Permission denied: Your role '${membership.role}' does not have permission '${permissionName}' for lists`
                );
            }

            (req as any).boardMembership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireBoardPermissionViaCard = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const cardId = req.params.cardId || req.params.id;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!cardId) {
                throw new ForbiddenException("Card ID is required");
            }

            const isSystemAdmin = user.roles?.includes("admin");
            if (isSystemAdmin) {
                return next();
            }

            const cardRepo = AppDataSource.getRepository(Card);
            const card = await cardRepo.findOne({ 
                where: { id: cardId, isActive: true },
                relations: ["list"]
            });

            if (!card || !card.list) {
                throw new ForbiddenException("Card not found or inactive");
            }

            const boardMemberRepo = AppDataSource.getRepository(BoardMember);
            const membership = await boardMemberRepo.findOne({
                where: {
                    boardId: (card.list as any).boardId,
                    userId: user.id,
                    isActive: true
                }
            });

            if (!membership) {
                throw new ForbiddenException("You are not a member of this board");
            }

            const hasAccess = await rbacCacheService.getPermission('board', membership.role, permissionName);
            
            if (hasAccess === null) {
                throw new ForbiddenException(`Permission '${permissionName}' not found in system`);
            }
            
            if (!hasAccess) {
                throw new ForbiddenException(
                    `Permission denied: Your role '${membership.role}' does not have permission '${permissionName}' for cards`
                );
            }

            (req as any).boardMembership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};
