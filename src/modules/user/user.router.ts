import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepo } from "./repository";
import { permissionEnum } from "../../config/seeders/rbac.seeder";
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
import { autoBindUtil, validateRequestMiddleware, authenticate, requirePermission, requireRole, checkIsOwnerOrAdmin, asyncHandler } from "../../common";
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
  authenticate,
  requirePermission(permissionEnum.USER.READ),
  validateRequestMiddleware({query: GetUsersPaginationQuerySchema}),
  asyncHandler(userController.getUsers)
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
  authenticate,
  checkIsOwnerOrAdmin("id"),
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    }),
  }),
  asyncHandler(userController.getUserById)
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
  authenticate,
  requirePermission(permissionEnum.USER.CREATE),
  validateRequestMiddleware({ body: CreateUserDto }),
  asyncHandler(userController.createUser)
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
  authenticate,
  checkIsOwnerOrAdmin("id"),
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    })
  }),
  validateRequestMiddleware({ body: UpdateUserDto }),
  asyncHandler(userController.updateUser)
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
  authenticate,
  requirePermission(permissionEnum.USER.DELETE),
  validateRequestMiddleware({
    params: z.object({
      id: z.string().uuid()
    })
  }),
  asyncHandler(userController.deleteUser)
);

export const userRouter = router;