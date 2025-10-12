import {z} from 'zod';

export interface HttpResponseBodySuccessDto<T> {
    data: T;
    totalPages?: number;
}

export const HttpResponseBodySuccessDtoSchema = <T extends z.ZodTypeAny>(dataSchema: T | null) => {
    return z.object({
        data: dataSchema ? dataSchema.optional() : z.null(),
        totalPages: z.number().optional(),
    });
}