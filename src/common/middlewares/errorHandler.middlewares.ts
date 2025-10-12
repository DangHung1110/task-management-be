import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions';
import { HttpResponseDto } from '../dtos';

export const errorHandlerMiddleware = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<Response> | void => {
	if (err instanceof HttpException) {
		return new HttpResponseDto().exception(err);
	}
	console.error('Unhandled error:', err);
	res.status(500).json({
		status: 500,
		message: 'Internal Server Error'
	});
};