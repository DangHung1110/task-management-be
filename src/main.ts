import "reflect-metadata";

import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import session from "express-session"

import { openAPIRouter } from "./swagger/openAPIRouter";
import { routers as moduleRouters } from "./modules/index";
import { appEnv } from "./config/app.config";
import passport from "./config/passport.config";
import { AppDataSource } from "./config/db.config";
import { runAllSeeders } from "./config/seeders";
import requestContextMiddleware from './common/middlewares/requestContext.middleware';
import { errorHandlerMiddleware } from "./common/middlewares";
import { create } from "domain";
import { createServer } from "http";
import notificationsGateway from "./modules/notifications/notifications.gateway";
import { RedisClient } from "./config/redis.config";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestContextMiddleware);
app.set("trust proxy", true);

app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));
app.use(session({
  secret: appEnv.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

AppDataSource.initialize()
  .then(async () => {
    const redisConn = await RedisClient.ping();
    if(redisConn) {
      console.log('Successfully connected to Redis');
    } else {
      console.error('Failed to connect to Redis');
    }
      
    await runAllSeeders();
    
    const { rbacCacheService } = await import('./common/cache/strategies/rbac.cache');
    await rbacCacheService.preloadAllPermissions();

    const healthCheckRouterInstance = new moduleRouters.healthCheckRouter();

    app.use("/health-check", healthCheckRouterInstance.router);
    app.use("/auth", moduleRouters.authRouter);
    app.use("/users", moduleRouters.userRouter);
    app.use("/workspaces", moduleRouters.workSpacesRouter);
    app.use("/workspaces", moduleRouters.workSpaceMemberRouter);
    app.use("/workspaces", moduleRouters.boardRouter);
    app.use("/boards", moduleRouters.boardRouter);
    app.use("/boards", moduleRouters.listRouter);
    app.use("/lists", moduleRouters.listRouter);
    app.use("/cards", moduleRouters.cardRouter);
    app.use("/notifications", moduleRouters.notificationsRouter);

    app.use(openAPIRouter);
    const server = createServer(app);
    notificationsGateway.initialize(server);

    server.listen(appEnv.PORT, () => {
      const { NODE_ENV, HOST, PORT } = appEnv;
      console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);
    process.exit(1);
  });

app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandlerMiddleware);