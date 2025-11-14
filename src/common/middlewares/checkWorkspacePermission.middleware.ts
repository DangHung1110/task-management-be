import { Request, Response, NextFunction} from "express"
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { WorkspaceMembers } from "../../entities";
import { AuthenticatedRequest } from "./auth.middlewares";

export const WorkSpaceMemberEnum = {
    OWNER: "owner",
    MEMBER: "member"
} as const;
export type WorkSpaceMemberRole = typeof WorkSpaceMemberEnum[keyof typeof WorkSpaceMemberEnum];

export const checkWorkspacePermission = (requiredRoles: WorkSpaceMemberRole[]) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try { 
            const user = req?.user;
            const { workspaceId } = req.params;

            if(!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if(!workspaceId) {
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

            if(!membership) {
                throw new ForbiddenException("You are not a member of this workspace");
            }

            if (!requiredRoles.includes(membership.role as WorkSpaceMemberRole)) {
                throw new ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`);
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}