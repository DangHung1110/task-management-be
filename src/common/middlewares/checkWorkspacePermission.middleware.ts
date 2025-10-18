import { Request, Response, NextFunction} from "express"
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { WorkspaceMembers } from "../../entities";
import { AuthenticatedRequest } from "./auth.middlewares";

export const WorkSpaceMemberEnum = {
    OWNER: "owner",
    ADMIN: "admin",
    MEMBER: "member"
}

export const checkWorkspacePermission = (requiredRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try { 
            const user = req?.user;
            const { workspaceId } = req.params;

            if(!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if(!workspaceId) {
                throw new ForbiddenException("Workspace ID is required");
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
                throw new ForbiddenException("User is not a member of this workspace");
            }

            if(!requiredRoles.includes(membership.role)) {
                throw new ForbiddenException("User does not have the required role");
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}