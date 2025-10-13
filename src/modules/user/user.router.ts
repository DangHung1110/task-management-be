import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepo } from "./repository";
import { 
  GetUsersPaginationQueryDto,
  GetUsersResponseDto,
  GetUserResponseDto,
  CreateUserDto,
  CreateUserResponseDto,
  UpdateUserDto,
  UpdateUserResponseDto,
  UserItemDto,
  PaginationMetaDto
} from "./dtos";
import { autoBindUtil, validateRequestMiddleware, authMiddleware } from "../../common";
import { createApiResponse } from "../../swagger";
import { AppDataSource } from "../../config";

extendZodWithOpenApi(z);

const GetUsersPaginationQuerySchema = GetUsersPaginationQueryDto.extend({}).openapi({
  example: { page: "1", limit: "10", search: "john" }
});

export const userRegistry = new OpenAPIRegistry();

userRegistry.register("UserItem", UserItemDto);
userRegistry.register("PaginationMeta", PaginationMetaDto);
userRegistry.register("GetUsersResponse", GetUsersResponseDto);
userRegistry.register("GetUserResponse", GetUserResponseDto);
userRegistry.register("CreateUser", CreateUserDto);
userRegistry.register("CreateUserResponse", CreateUserResponseDto);
userRegistry.register("UpdateUser", UpdateUserDto);
userRegistry.register("UpdateUserResponse", UpdateUserResponseDto);
userRegistry.register("GetUsersPaginationQuery", GetUsersPaginationQuerySchema);

const userRepo = new UserRepo(AppDataSource);
const userService = new UserService(userRepo);
const userController = new UserController(userService);
const router = express.Router({ mergeParams: true });
autoBindUtil(userController);

userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    query: GetUsersPaginationQuerySchema,
  },
  responses: createApiResponse(
    GetUsersResponseDto,
    "Get users with pagination successfully"
  ),
});
router.get(
  "/",
  authMiddleware,
  validateRequestMiddleware({query: GetUsersPaginationQuerySchema}),
  userController.getUsers
);

userRegistry.registerPath({
  method: "get",
  path: "/users/:id",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: createApiResponse(
    GetUserResponseDto,
    "Get user by ID successfully"
  ),
});

router.get(
  "/:id",
  authMiddleware,
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    }),
  }),
  userController.getUserById
);

userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserDto
        }
      }
    }
  },
  responses: createApiResponse(
    CreateUserResponseDto,
    "Create user successfully"
  ),
});

router.post(
  "/",
  authMiddleware,
  validateRequestMiddleware({ body: CreateUserDto }),
  userController.createUser
);

userRegistry.registerPath({
  method: "put",
  path: "/users/:id",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid()
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateUserDto
        }
      }
    }
  },
  responses: createApiResponse(
    UpdateUserResponseDto,
    "Update user successfully"
  ),
});

router.put(
  "/:id",
  authMiddleware,
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    })
  }),
  validateRequestMiddleware({ body: UpdateUserDto }),
  userController.updateUser
);

userRegistry.registerPath({
  method: "delete",
  path: "/users/:id",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid()
    })
  },
  responses: createApiResponse(
    z.object({
      message: z.string()
    }),
    "Delete user successfully"
  ),
});

router.delete(
  "/:id",
  authMiddleware,
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    })
  }),
  userController.deleteUser
);

export const userRouter = router;