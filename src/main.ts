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

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
// Attach per-request context (used by HttpResponseDto to access Response object)
app.use(requestContextMiddleware);
app.set("trust proxy", true);

// Middlewares
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
app.use(passport.initialize());
app.use(passport.session());

AppDataSource.initialize()
  .then(async () => {
    // Run seeders to create admin user and roles
    await runAllSeeders();

    const healCheckRouterInstance = new moduleRouters.healthCheckRouter();
    
    app.use("/health-check", healCheckRouterInstance.router);
    app.use("/auth", moduleRouters.authRouter);
    app.use("/users", moduleRouters.userRouter);
    app.use("/work-spaces", moduleRouters.workSpacesRouter);

    app.use(openAPIRouter);

    app.listen(appEnv.PORT, () => {
      const { NODE_ENV, HOST, PORT } = appEnv;
      console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);
    process.exit(1);
  });