import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";
import { notificationsController } from "./notifications.controller";
import { asyncHandler, authMiddleware } from "../../common";

extendZodWithOpenApi(z);

const router = express.Router();
export const notificationsRegistry = new OpenAPIRegistry();

notificationsRegistry.registerPath({
    method: "get",
    path: "/notifications",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    request: {
        query: z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
            unreadOnly: z.string().optional()
        })
    },
    responses: {
        200: {
            description: "Notifications retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string(),
                        data: z.array(z.any()),
                        pagination: z.object({
                            page: z.number(),
                            limit: z.number(),
                            total: z.number(),
                            totalPages: z.number()
                        })
                    })
                }
            }
        }
    }
});

notificationsRegistry.registerPath({
    method: "get",
    path: "/notifications/unread-count",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Unread count retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string(),
                        data: z.object({ count: z.number() })
                    })
                }
            }
        }
    }
});

notificationsRegistry.registerPath({
    method: "patch",
    path: "/notifications/{notificationId}/read",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            notificationId: z.string()
        })
    },
    responses: {
        200: {
            description: "Notification marked as read",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string()
                    })
                }
            }
        }
    }
});

notificationsRegistry.registerPath({
    method: "patch",
    path: "/notifications/read-all",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "All notifications marked as read",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string(),
                        data: z.object({ count: z.number() })
                    })
                }
            }
        }
    }
});

notificationsRegistry.registerPath({
    method: "delete",
    path: "/notifications/{notificationId}",
    tags: ["Notifications"],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            notificationId: z.string()
        })
    },
    responses: {
        200: {
            description: "Notification deleted successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string()
                    })
                }
            }
        }
    }
});

router.get(
    "/notifications/unread-count",
    authMiddleware,
    asyncHandler(notificationsController.getUnreadCount.bind(notificationsController))
);

router.get(
    "/notifications",
    authMiddleware,
    asyncHandler(notificationsController.getNotifications.bind(notificationsController))
);

router.patch(
    "/notifications/read-all",
    authMiddleware,
    asyncHandler(notificationsController.markAllAsRead.bind(notificationsController))
);

router.patch(
    "/notifications/:notificationId/read",
    authMiddleware,
    asyncHandler(notificationsController.markAsRead.bind(notificationsController))
);

router.delete(
    "/notifications/:notificationId",
    authMiddleware,
    asyncHandler(notificationsController.deleteNotification.bind(notificationsController))
);

export const notificationsRouter = router;
