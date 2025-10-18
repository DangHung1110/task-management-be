import { z} from 'zod';

import { zodValidationSchema } from '../../../../common';

export class loginRequestDto {
    email!: string;
    password!: string;
}

export const loginRequestValidationSchema: zodValidationSchema = {
    body: z.object({ 
        email: z.email(),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
    })
}

export const loginRequestSchema = {
    body: {
        description: 'Login Request',
        content: {
            'application/json': {
                schema: loginRequestValidationSchema.body!,
            }
        }
    }
}



