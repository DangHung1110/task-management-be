import { z } from 'zod';
import { User, UserRole } from '../../../../entities';

export class AccountResponseDto {
    id!: string;
    email!: string;
    name!: string;
    roles!: string[]; 
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;    
        this.name = user.name;
        this.isActive = user.isActive;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.roles = user.userRoles.map(ur => ur.role.name) || [] ;
    }
}

export const accountResponseDtoSchema = z.object({
    id:z.string(),
    email:z.email(),
    name:z.string(),
    roles: z.array(z.enum(Object.values(UserRole))),
    isActive:z.boolean(),
    createdAt:z.date(),
    updatedAt:z.date(),
})
export type AccountResponse = z.infer<typeof accountResponseDtoSchema>;