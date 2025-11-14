import { z } from 'zod'
import { zodValidationSchema } from '../../../../common';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

export class registerRequestDto {
    email!: string;
    password!: string;
    name!: string;
}

export const registerRequestValidationSchema: zodValidationSchema = {
    body: z.object({ 
        email: z.email(),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        name: z.string().min(2, 'Name must be at least 2 characters long'),
    })
}   

export const registerRequestSchema = {
    body: {
        description: 'Register Request',
        content: {
            'application/json': {
                schema: registerRequestValidationSchema.body!,
            }
        }
    }
}