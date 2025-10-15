import { User as UserEntity } from "../entities/User/user";

declare global {
    namespace Express {
        interface User extends UserEntity {
            roles: string[];
            permissions: string[];
        }

        interface Request {
            user?: User;
        }
    }
}

export {};
