import { AppDataSource } from "../../config";
import { Notification } from "../../entities";
import { pubSubService } from "../../common/pubsub/pubsub.service";
import { PUBSUB_CHANNELS } from "../../common/pubsub/events";
import notificationsGateway from "./notifications.gateway";

export interface NotificationPayload {
    userId: string;
    type: string;
    message: string;
    activityId?: string;
    metadata?: Record<string, any>;
    actionUrl?: string;
}

export class NotificationsService {
    private readonly notificationRepo = AppDataSource.getRepository(Notification);
    
    async createNotification(payload: NotificationPayload): Promise<Notification> {
        const notification = this.notificationRepo.create({
            userId: payload.userId,
            type: payload.type as any,
            message: payload.message,
            activityId: payload.activityId || null,
            metadata: payload.metadata || null,
            actionUrl: payload.actionUrl || null,
            isRead: false,
            readAt: null
        });
        
        await this.notificationRepo.save(notification);
        
        await pubSubService.publish(PUBSUB_CHANNELS.NOTIFICATION_CREATED, {
            notification
        });
        
        await notificationsGateway.sendMessageToUser(payload.userId, {
            event: 'new_notification',
            data: notification
        });
        
        return notification;
    }
    
    async createBulkNotifications(
        userIds: string[],
        payload: Omit<NotificationPayload, 'userId'>
    ): Promise<Notification[]> {
        const notifications: Notification[] = [];
        
        for (const userId of userIds) {
            const notification = await this.createNotification({
                ...payload,
                userId
            });
            notifications.push(notification);
        }
        
        return notifications;
    }
    
    async getUserNotifications(
        userId: string,
        options: {
            page?: number;
            limit?: number;
            unreadOnly?: boolean;
        } = {}
    ) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        
        const query = this.notificationRepo
            .createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        
        if (options.unreadOnly) {
            query.andWhere('notification.isRead = :isRead', { isRead: false });
        }
        
        const [notifications, total] = await query.getManyAndCount();
        
        return {
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    
    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const result = await this.notificationRepo.update(
            {
                id: notificationId,
                userId
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );
        
        return result.affected ? result.affected > 0 : false;
    }
    
    async markAllAsRead(userId: string): Promise<number> {
        const result = await this.notificationRepo.update(
            {
                userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );
        
        return result.affected || 0;
    }
    
    async getUnreadCount(userId: string): Promise<number> {
        return await this.notificationRepo.count({
            where: {
                userId,
                isRead: false
            }
        });
    }
    
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        const result = await this.notificationRepo.delete({
            id: notificationId,
            userId
        });
        
        return result.affected ? result.affected > 0 : false;
    }
}

export const notificationsService = new NotificationsService();