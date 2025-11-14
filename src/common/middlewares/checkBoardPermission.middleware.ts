import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { BoardMember } from "../../entities";

export const BoardMemberEnum = {
    OWNER: "owner",
    ADMIN: "admin",
    MEMBER: "member"
};

export const checkBoardPermission = (requiredRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req?.user;
            const { boardId } = req.params;

            if (!user) {
                throw new UnauthorizedException("User not authenticated");
            }

            if (!boardId) {
                throw new ForbiddenException("Board ID is required");
            }

            // System admin bypasses board permission checks
            const isSystemAdmin = user.roles?.includes("admin");
            if (isSystemAdmin) {
                return next();
            }

            // Check board membership for regular users
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

            if (!requiredRoles.includes(membership.role)) {
                throw new ForbiddenException(
                    `Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
