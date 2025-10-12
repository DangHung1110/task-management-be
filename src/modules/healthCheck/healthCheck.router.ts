import express, { Router } from "express";
import { healthCheckController } from "./healthCheck.controller";
import { healthCheckRegistry } from "./healCheck.registry";

export class healthCheckRouter {
    public router: Router;
    private healthCheckController: healthCheckController;
    constructor() {
        this.router = express.Router();
        this.healthCheckController = new healthCheckController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/health", this.healthCheckController.checkHealth);
    }
}