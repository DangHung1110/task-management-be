import { z } from 'zod';

export class LoginResponseDto {
    accessToken!: string;
    refreshToken!: string;
}

export const loginResponseDtoSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
}); 
