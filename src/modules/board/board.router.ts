import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { BoardRepo } from "./repository/board.repository";
import { WorkSpacesRepo } from "../workSpaces/repository";

import { 
    getBoardsPaginationQueryDto,
    listBoardsResponseSchema,
    boardResponseSchema,
    createBoardRequestDto,
    updateBoardRequestDto
} from "./dtos";

import { 
    autoBindUtil, 
    validateRequestMiddleware, 
    authenticate, 
    checkWorkspacePermission,
    checkBoardPermission
} from "../../common";
import { createApiResponse } from "../../swagger";
import { AppDataSource } from "../../config";

extendZodWithOpenApi(z);

const GetBoardsPaginationQuerySchema = getBoardsPaginationQueryDto.extend({}).openapi({
    example: { page: "1", limit: "10", search: "project", workspaceId: "uuid" }
}); 

const CreateBoardRequestSchema = createBoardRequestDto.openapi({
    example: { 
        name: "My Board",
        description: "This is my board description",
        visibility: "workspace"
    }
});

const UpdateBoardRequestSchema = updateBoardRequestDto.openapi({
    example: {
        name: "Updated Board Name",
        visibility: "private"
    }
});

export const boardRegistry = new OpenAPIRegistry();

boardRegistry.register("GetBoardsPaginationQuery", GetBoardsPaginationQuerySchema);
boardRegistry.register("ListBoardsResponse", listBoardsResponseSchema);
boardRegistry.register("BoardResponse", boardResponseSchema);
boardRegistry.register("CreateBoardRequest", CreateBoardRequestSchema);
boardRegistry.register("UpdateBoardRequest", UpdateBoardRequestSchema);

const boardRepo = new BoardRepo(AppDataSource);
const workSpacesRepo = new WorkSpacesRepo(AppDataSource);
const boardService = new BoardService(boardRepo, workSpacesRepo);
const boardController = new BoardController(boardService);
const router = express.Router({ mergeParams: true });
autoBindUtil(boardController);

// Routes
boardRegistry.registerPath({
    method: "get",
    path: "/boards",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        query: GetBoardsPaginationQuerySchema,
    },
    responses: createApiResponse(
        listBoardsResponseSchema,
        "Get Boards with pagination successfully"
    ),
});
router.get(
    "/",
    authenticate,
    validateRequestMiddleware({ query: GetBoardsPaginationQuerySchema }),
    boardController.getBoards
);

boardRegistry.registerPath({
    method: "get",
    path: "/boards/{boardId}",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        boardResponseSchema,
        "Get Board by ID successfully"
    ),
});
router.get(
    "/:boardId",
    authenticate,
    checkBoardPermission(["owner", "admin", "member"]),
    boardController.getBoardById
);

boardRegistry.registerPath({
    method: "post",
    path: "/workspaces/{workspaceId}/boards",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: CreateBoardRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        boardResponseSchema,
        "Board created successfully"
    ),
});
router.post(
    "/workspaces/:workspaceId/boards",
    authenticate,
    checkWorkspacePermission(["owner", "member"]),
    validateRequestMiddleware({ body: CreateBoardRequestSchema }),
    boardController.createBoard
);

boardRegistry.registerPath({
    method: "put",
    path: "/boards/{boardId}",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: UpdateBoardRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        boardResponseSchema,
        "Board updated successfully"
    ),
});
router.put(
    "/:boardId",
    authenticate,
    checkBoardPermission(["owner", "admin"]),
    validateRequestMiddleware({ body: UpdateBoardRequestSchema }),
    boardController.updateBoard
);

boardRegistry.registerPath({
    method: "delete",
    path: "/boards/{boardId}/soft",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "Board soft deleted successfully"
    ),
});
router.delete(
    "/:boardId/soft",
    authenticate,
    checkBoardPermission(["owner", "admin"]),
    boardController.softDeleteBoard
);

boardRegistry.registerPath({
    method: "delete",
    path: "/boards/{boardId}/hard",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "Board hard deleted successfully"
    ),
});
router.delete(
    "/:boardId/hard",
    authenticate,
    checkBoardPermission(["owner"]),
    boardController.hardDeleteBoard
);

boardRegistry.registerPath({
    method: "patch",
    path: "/boards/{boardId}/restore",
    tags: ["Boards"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            boardId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "Board restored successfully"
    ),
});
router.patch(
    "/:boardId/restore",
    authenticate,
    checkBoardPermission(["owner"]),
    boardController.restoreBoard
);

export const boardRouter = router;

