import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { ListController } from "./list.controller";
import { ListService } from "./list.service";
import { ListRepo } from "./repository";
import { BoardRepo } from "../board/repository";

import {
    createListRequestDto,
    updateListRequestDto,
    swapListPositionRequestDto,
    getListpagiantionRequestDto,
    getListsResponseSchema,
    getListSchema,
} from "./dtos";

import {
    autoBindUtil,
    validateRequestMiddleware,
    authenticate,
    requireBoardPermission,
    requireBoardPermissionViaList,
    asyncHandler
} from "../../common";
import { createApiResponse } from "../../swagger";
import { AppDataSource } from "../../config";

extendZodWithOpenApi(z);

const GetListsPaginationQuerySchema = getListpagiantionRequestDto.extend({}).openapi({
    example: { page: "1", limit: "10", search: "list name", boardId: "uuid" }
});

const CreateListRequestSchema = createListRequestDto.openapi({
    example: {
        name: "My List"
    }
});

const UpdateListRequestSchema = updateListRequestDto.openapi({
    example: {
        name: "Updated List Name",
        cardLimit: 10,
        isArchived: false
    }
});

const SwapListPositionRequestSchema = swapListPositionRequestDto.openapi({
    example: {
        firstListId: "uuid-1",
        secondListId: "uuid-2"
    }
});

export const listRegistry = new OpenAPIRegistry();

listRegistry.register("GetListsPaginationQuery", GetListsPaginationQuerySchema);
listRegistry.register("ListResponse", getListSchema);
listRegistry.register("ListsResponse", getListsResponseSchema);
listRegistry.register("CreateListRequest", CreateListRequestSchema);
listRegistry.register("UpdateListRequest", UpdateListRequestSchema);
listRegistry.register("SwapListPositionRequest", SwapListPositionRequestSchema);

const listRepo = new ListRepo(AppDataSource);
const boardRepo = new BoardRepo(AppDataSource);
const listService = new ListService(listRepo, boardRepo);
const listController = new ListController(listService);
const router = express.Router({ mergeParams: true });
autoBindUtil(listController);

// Routes
listRegistry.registerPath({
    method: "get",
    path: "/boards/{boardId}/lists",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        }),
        query: GetListsPaginationQuerySchema,
    },
    responses: createApiResponse(
        getListsResponseSchema,
        "Get Lists with pagination successfully"
    ),
});
router.get(
    "/:boardId/lists",
    authenticate,
    requireBoardPermission('canView'),
    validateRequestMiddleware({ query: GetListsPaginationQuerySchema }),
    asyncHandler(listController.getLists)
);

listRegistry.registerPath({
    method: "get",
    path: "/lists/{listId}",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            listId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        getListSchema,
        "Get List by ID successfully"
    ),
});
router.get(
    "/lists/:id",
    authenticate,
    requireBoardPermissionViaList('canView'),
    asyncHandler(listController.getListById)
);

listRegistry.registerPath({
    method: "post",
    path: "/boards/{boardId}/lists",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: CreateListRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        getListSchema,
        "List created successfully"
    ),
});
router.post(
    "/:boardId/lists",
    authenticate,
    requireBoardPermission('canManageLists'),
    validateRequestMiddleware({ body: CreateListRequestSchema }),
    asyncHandler(listController.createList)
);

listRegistry.registerPath({
    method: "put",
    path: "/lists/{listId}",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            listId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: UpdateListRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        getListSchema,
        "List updated successfully"
    ),
});
router.put(
    "/lists/:id",
    authenticate,
    requireBoardPermissionViaList('canManageLists'),
    validateRequestMiddleware({ body: UpdateListRequestSchema }),
    asyncHandler(listController.updateList)
);

listRegistry.registerPath({
    method: "delete",
    path: "/lists/{listId}",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            listId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "List deleted successfully"
    ),
});
router.delete(
    "/lists/:id",
    authenticate,
    requireBoardPermissionViaList('canManageLists'),
    asyncHandler(listController.deleteList)
);

listRegistry.registerPath({
    method: "delete",
    path: "/lists/{listId}/hard",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            listId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "List permanently deleted successfully"
    ),
});
router.delete(
    "/lists/:id/hard",
    authenticate,
    requireBoardPermissionViaList('canManageLists'),
    asyncHandler(listController.hardDeleteList)
);

listRegistry.registerPath({
    method: "patch",
    path: "/lists/{listId}/restore",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            listId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "List restored successfully"
    ),
});
router.patch(
    "/lists/:id/restore",
    authenticate,
    requireBoardPermissionViaList('canManageLists'),
    asyncHandler(listController.restoreList)
);

listRegistry.registerPath({
    method: "post",
    path: "/lists/swap-position",
    tags: ["Lists"],
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SwapListPositionRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "List positions swapped successfully"
    ),
});
router.post(
    "/lists/swap-position",
    authenticate,
    requireBoardPermissionViaList('canManageLists'),
    validateRequestMiddleware({ body: SwapListPositionRequestSchema }),
    asyncHandler(listController.swapListPosition)
);

export const listRouter = router;

