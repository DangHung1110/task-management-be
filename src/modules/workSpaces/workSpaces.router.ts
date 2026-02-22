import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

import { WorkSpacesController } from "./workSpaces.controller";
import { WorkSpacesService } from "./workSpaces.service";
import { WorkSpacesRepo } from "./repository";

import { 
    GetWorkSpacesPaginationQueryDto,
    WorkSpacesListResponseSchema,
    WorkSpacesResponseSchema,
    workSpaceCreateRequestDto,
    workSpaceUpdateRequestDto
} from "./dtos";

import { 
    autoBindUtil, 
    validateRequestMiddleware, 
    authenticate,
    requireWorkspacePermission,
    asyncHandler
} from "../../common";
import { createApiResponse } from "../../swagger";
import { AppDataSource } from "../../config";

extendZodWithOpenApi(z);

const GetWorkSpacesPaginationQuerySchema = GetWorkSpacesPaginationQueryDto.extend({}).openapi({
    example: { page: "1", limit: "10", search: "project" }
}); 

const WorkSpaceCreateRequestSchema = workSpaceCreateRequestDto.openapi({
    example: { 
        name: "My Workspace",
        description: "This is my workspace description"
    }
});

const WorkSpaceUpdateRequestSchema = workSpaceUpdateRequestDto.openapi({
    example: {
        name: "Updated Workspace Name",
        description: "Updated description"
    }
});

export const workSpacesRegistry = new OpenAPIRegistry();

workSpacesRegistry.register("GetWorkSpacesPaginationQuery", GetWorkSpacesPaginationQuerySchema);
workSpacesRegistry.register("WorkSpacesListResponse", WorkSpacesListResponseSchema);
workSpacesRegistry.register("WorkSpacesResponse", WorkSpacesResponseSchema);
workSpacesRegistry.register("WorkSpaceCreateRequest", WorkSpaceCreateRequestSchema);
workSpacesRegistry.register("WorkSpaceUpdateRequest", WorkSpaceUpdateRequestSchema);

const workSpacesRepo = new WorkSpacesRepo(AppDataSource);
const workSpacesService = new WorkSpacesService(workSpacesRepo);
const workSpacesController = new WorkSpacesController(workSpacesService);
const router = express.Router({ mergeParams: true });
autoBindUtil(workSpacesController);

workSpacesRegistry.registerPath({
    method: "get",
    path: "/workspaces",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        query: GetWorkSpacesPaginationQuerySchema,
    },
    responses: createApiResponse(
        WorkSpacesListResponseSchema,
        "Get WorkSpaces with pagination successfully"
    ),
});
router.get(
    "/",
    authenticate,
    validateRequestMiddleware({ query: GetWorkSpacesPaginationQuerySchema }),
    asyncHandler(workSpacesController.getWorkSpaces)
);

workSpacesRegistry.registerPath({
    method: "get",
    path: "/workspaces/{workspaceId}",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        WorkSpacesResponseSchema,
        "Get WorkSpace by ID successfully"
    ),
});
router.get(
    "/:workspaceId",
    authenticate,
    requireWorkspacePermission('canView'),
    asyncHandler(workSpacesController.getWorkSpaceById)
);

workSpacesRegistry.registerPath({
    method: "post",
    path: "/workspaces",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: WorkSpaceCreateRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        WorkSpacesResponseSchema,
        "WorkSpace created successfully"
    ),
});
router.post(
    "/",
    authenticate,
    validateRequestMiddleware({ body: WorkSpaceCreateRequestSchema }),
    asyncHandler(workSpacesController.createWorkSpace)
);

workSpacesRegistry.registerPath({
    method: "put",
    path: "/workspaces/{workspaceId}",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: WorkSpaceUpdateRequestSchema
                }
            }
        }
    },
    responses: createApiResponse(
        WorkSpacesResponseSchema,
        "WorkSpace updated successfully"
    ),
});
router.put(
    "/:workspaceId",
    authenticate,
    requireWorkspacePermission('canUpdate'),
    validateRequestMiddleware({ body: WorkSpaceUpdateRequestSchema }),
    asyncHandler(workSpacesController.updateWorkSpace)
);

workSpacesRegistry.registerPath({
    method: "delete",
    path: "/workspaces/{workspaceId}/soft",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "WorkSpace soft deleted successfully"
    ),
});
router.delete(
    "/:workspaceId/soft",
    authenticate,
    requireWorkspacePermission('canDelete'),
    asyncHandler(workSpacesController.shoftDeleteWorkSpace)
);

workSpacesRegistry.registerPath({
    method: "delete",
    path: "/workspaces/{workspaceId}/hard",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "WorkSpace hard deleted successfully"
    ),
});
router.delete(
    "/:workspaceId/hard",
    authenticate,
    requireWorkspacePermission('canDelete'),
    asyncHandler(workSpacesController.hardDeleteWorkSpace)
);

workSpacesRegistry.registerPath({
    method: "patch",
    path: "/workspaces/{workspaceId}/restore",
    tags: ["WorkSpaces"],
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            workspaceId: z.string().uuid()
        })
    },
    responses: createApiResponse(
        z.object({ message: z.string() }),
        "WorkSpace restored successfully"
    ),
});
router.patch(
    "/:workspaceId/restore",
    authenticate,
    requireWorkspacePermission('canUpdate'),
    asyncHandler(workSpacesController.restoreWorkSpace)
);

export const workSpacesRouter = router;

