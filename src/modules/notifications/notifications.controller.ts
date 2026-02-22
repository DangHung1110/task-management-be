import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { HttpResponseDto } from "../../common";

export class NotificationsController {
    async getNotifications(req: Request, res: Response) {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';
        
        const result = await notificationsService.getUserNotifications(userId, {
            page,
            limit,
            unreadOnly
        });
        
        return new HttpResponseDto().success({
            data: result.data,
            message: "Notifications retrieved successfully",
            pagination: result.pagination
        });
    }
    
    async getUnreadCount(req: Request, res: Response) {
        const userId = req.user!.id;
        const count = await notificationsService.getUnreadCount(userId);
        
        return new HttpResponseDto().success({
            data: { count },
            message: "Unread count retrieved successfully"
        });
    }
    
    async markAsRead(req: Request, res: Response) {
        const userId = req.user!.id;
        const { notificationId } = req.params;
        
        const updated = await notificationsService.markAsRead(notificationId, userId);
        
        if (!updated) {
            return new HttpResponseDto().badRequest({
                message: "Notification not found or already read"
            });
        }
        
        return new HttpResponseDto().success({
            message: "Notification marked as read"
        });
    }
    
    async markAllAsRead(req: Request, res: Response) {
        const userId = req.user!.id;
        const count = await notificationsService.markAllAsRead(userId);
        
        return new HttpResponseDto().success({
            data: { count },
            message: `${count} notifications marked as read`
        });
    }
    
    async deleteNotification(req: Request, res: Response) {
        const userId = req.user!.id;
        const { notificationId } = req.params;
        
        const deleted = await notificationsService.deleteNotification(notificationId, userId);
        
        if (!deleted) {
            return new HttpResponseDto().badRequest({
                message: "Notification not found"
            });
        }
        
        return new HttpResponseDto().success({
            message: "Notification deleted successfully"
        });
    }
}

export const notificationsController = new NotificationsController();
