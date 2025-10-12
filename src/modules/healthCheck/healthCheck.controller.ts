import { healthCheckService } from "./healthCheck.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class healthCheckController {
    private HealthCheckService: healthCheckService;

    constructor() {
        this.HealthCheckService = new healthCheckService();
    }

    async checkHealth(req: Request, res: Response) {
        const serviceResponse = await this.HealthCheckService.checkHealth();
        return res.status(StatusCodes.OK).json({
            success: serviceResponse.success,
            message: serviceResponse.message,
            data: serviceResponse.data,
            code: serviceResponse.code
        });
    }
}