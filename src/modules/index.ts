import { healthCheckRouter } from "./healthCheck/healthCheck.router";
import { healthCheckRegistry } from "./healthCheck/healCheck.registry";
import { authRouter, authRegistry } from "./auth/auth.router";
import { userRouter, userRegistry } from "./user/user.router";
import { workSpacesRouter, workSpacesRegistry} from "./workSpaces/workSpaces.router";
import { boardRouter, boardRegistry } from "./board/board.router";

export const Registries = [healthCheckRegistry, authRegistry, userRegistry, workSpacesRegistry, boardRegistry];

export const routers = {
    authRouter,
    userRouter,
    healthCheckRouter,
    workSpacesRouter,
    boardRouter
};