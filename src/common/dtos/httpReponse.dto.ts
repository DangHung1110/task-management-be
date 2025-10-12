import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpResponseBodySuccessDto } from './httpResponseBodySuccess.dto';
import { HttpException } from '../exceptions';
import { getResponse } from '../utils';

export class HttpResponseDto {
    async success<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
        const res = getResponse();
        return res.status(StatusCodes.OK).json(data);
    }

    async created<T>(data: HttpResponseBodySuccessDto<T>): Promise<Response> {
        const res = getResponse();
        return res.status(StatusCodes.CREATED).json(data);
    }

    async exception(exceptions: HttpException): Promise<Response> {
        const res = getResponse();
        return res.status(exceptions.statusCode).json({
            status: exceptions.statusCode,
            message: exceptions.message
        })
    }
}