import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import z, { ZodError, ZodSchema } from 'zod';

import { OptionalException } from '../exceptions';

export class zodValidationSchema { 
	body?: ZodSchema;
	query?: ZodSchema;
	params?: ZodSchema;
	headers?: ZodSchema | ZodSchema[];
	cookies?: ZodSchema ;
	[key: string]: ZodSchema | ZodSchema[] | undefined;
}

export const validateRequestMiddleware =
	(schema: zodValidationSchema) =>
	(req: Request, res: Response, next: NextFunction): void => {
		try {
			for (const key in schema) {
				const  zodSchema: ZodSchema | ZodSchema[] | undefined = schema[key as keyof zodValidationSchema]; 
				if (zodSchema && !Array.isArray(zodSchema)) {
					zodSchema.parse(req[key as keyof Request]);
				}
			else {
				(zodSchema as ZodSchema[]).forEach((s) => s.parse(req[key as keyof Request]));
			}
		}
		next();
		} catch (err) {
			const errorMessage = `${(err as ZodError).issues.map((e) => e.message).join(', ')}`;
			throw new OptionalException(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
		}
	};