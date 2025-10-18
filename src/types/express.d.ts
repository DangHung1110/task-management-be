import { User as UserEntity } from "../entities/User/user";
import { BoardMember } from "../entities/Boards/boardMember.entities";
import { WorkspaceMember } from "../entities/Workspaces/workspaceMember.entities";

declare global {
    namespace Express {
        interface User extends UserEntity {
            roles: string[];
            permissions: string[];
        }

        interface Request {
            user?: User;
            workspaceMembership?: WorkspaceMember;  
            boardMembership?: BoardMember;  
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        role: string;
        status: string;
        permissions?: string[];
    };
    workspaceMembership?: WorkspaceMember;
    boardMembership?: BoardMember;
}
