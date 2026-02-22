import { healthCheckRouter } from "./healthCheck/healthCheck.router";
import { healthCheckRegistry } from "./healthCheck/healCheck.registry";
import { authRouter, authRegistry } from "./auth/auth.router";
import { userRouter, userRegistry } from "./user/user.router";
import { workSpacesRouter, workSpacesRegistry} from "./workSpaces/workSpaces.router";
import { boardRouter, boardRegistry } from "./board/board.router";

import { workSpaceMemberRouter, workSpaceMemberRegistry } from "./workSpace_member/workSpace_member.router";
import { listRouter, listRegistry } from "./lists/list.router";
import { cardRouter, cardRegistry } from "./cards/card.router";
import { notificationsRouter, notificationsRegistry } from "./notifications/notifications.router";
export const Registries = [healthCheckRegistry, authRegistry, userRegistry, workSpacesRegistry, boardRegistry, workSpaceMemberRegistry, listRegistry, cardRegistry, notificationsRegistry];

export const routers = {
    authRouter,
    userRouter,
    healthCheckRouter,
    workSpacesRouter,
    boardRouter,
    workSpaceMemberRouter,
    listRouter,
    cardRouter,
    notificationsRouter,
};