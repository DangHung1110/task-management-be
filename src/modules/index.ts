import { healthCheckRouter } from "./healthCheck/healthCheck.router";
import { healthCheckRegistry } from "./healthCheck/healCheck.registry";
import { authRouter, authRegistry } from "./auth/auth.router";
import { userRouter, userRegistry } from "./user/user.router";

export const Registries = [healthCheckRegistry, authRegistry, userRegistry];

export const routers = {
    authRouter,
    userRouter,
    healthCheckRouter,
};