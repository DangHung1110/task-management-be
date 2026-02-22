import { notificationsService, NotificationPayload } from "./notifications.service";

export class NotificationHelpers {
    static async notifyCardAssignment(data: {
        assignedUserId: string;
        cardId: string;
        cardTitle: string;
        boardId: string;
        assignedByUserName: string;
    }) {
        const payload: NotificationPayload = {
            userId: data.assignedUserId,
            type: "CARD_ASSIGNMENT",
            message: `${data.assignedByUserName} assigned you to card "${data.cardTitle}"`,
            metadata: {
                cardId: data.cardId,
                boardId: data.boardId
            },
            actionUrl: `/boards/${data.boardId}/cards/${data.cardId}`
        };
        
        return await notificationsService.createNotification(payload);
    }
    
    static async notifyCardMention(data: {
        mentionedUserIds: string[];
        cardId: string;
        cardTitle: string;
        boardId: string;
        mentionedByUserName: string;
        commentContent?: string;
    }) {
        const message = data.commentContent
            ? `${data.mentionedByUserName} mentioned you in a comment on "${data.cardTitle}"`
            : `${data.mentionedByUserName} mentioned you in "${data.cardTitle}"`;
        
        return await notificationsService.createBulkNotifications(
            data.mentionedUserIds,
            {
                type: "MENTION",
                message,
                metadata: {
                    cardId: data.cardId,
                    boardId: data.boardId,
                    commentContent: data.commentContent
                },
                actionUrl: `/boards/${data.boardId}/cards/${data.cardId}`
            }
        );
    }
    
    static async notifyCardDueDate(data: {
        assignedUserIds: string[];
        cardId: string;
        cardTitle: string;
        boardId: string;
        dueDate: Date;
    }) {
        const message = `Card "${data.cardTitle}" is due soon`;
        
        return await notificationsService.createBulkNotifications(
            data.assignedUserIds,
            {
                type: "DUE_DATE_REMINDER",
                message,
                metadata: {
                    cardId: data.cardId,
                    boardId: data.boardId,
                    dueDate: data.dueDate
                },
                actionUrl: `/boards/${data.boardId}/cards/${data.cardId}`
            }
        );
    }
    
    static async notifyCommentAdded(data: {
        cardMemberIds: string[];
        cardId: string;
        cardTitle: string;
        boardId: string;
        commenterName: string;
        excludeUserId?: string;
    }) {
        const userIds = data.excludeUserId
            ? data.cardMemberIds.filter(id => id !== data.excludeUserId)
            : data.cardMemberIds;
        
        if (userIds.length === 0) return [];
        
        return await notificationsService.createBulkNotifications(
            userIds,
            {
                type: "COMMENT_ADDED",
                message: `${data.commenterName} commented on "${data.cardTitle}"`,
                metadata: {
                    cardId: data.cardId,
                    boardId: data.boardId
                },
                actionUrl: `/boards/${data.boardId}/cards/${data.cardId}`
            }
        );
    }
    
    static async notifyBoardInvitation(data: {
        invitedUserId: string;
        boardId: string;
        boardTitle: string;
        invitedByUserName: string;
        role: string;
    }) {
        const payload: NotificationPayload = {
            userId: data.invitedUserId,
            type: "BOARD_INVITATION",
            message: `${data.invitedByUserName} invited you to board "${data.boardTitle}" as ${data.role}`,
            metadata: {
                boardId: data.boardId,
                role: data.role
            },
            actionUrl: `/boards/${data.boardId}`
        };
        
        return await notificationsService.createNotification(payload);
    }
    
    static async notifyWorkspaceInvitation(data: {
        invitedUserId: string;
        workspaceId: string;
        workspaceName: string;
        invitedByUserName: string;
        role: string;
    }) {
        const payload: NotificationPayload = {
            userId: data.invitedUserId,
            type: "WORKSPACE_INVITATION",
            message: `${data.invitedByUserName} invited you to workspace "${data.workspaceName}" as ${data.role}`,
            metadata: {
                workspaceId: data.workspaceId,
                role: data.role
            },
            actionUrl: `/workspaces/${data.workspaceId}`
        };
        
        return await notificationsService.createNotification(payload);
    }
    
    static async notifyCardMoved(data: {
        cardMemberIds: string[];
        cardId: string;
        cardTitle: string;
        boardId: string;
        fromListName: string;
        toListName: string;
        movedByUserName: string;
        excludeUserId?: string;
    }) {
        const userIds = data.excludeUserId
            ? data.cardMemberIds.filter(id => id !== data.excludeUserId)
            : data.cardMemberIds;
        
        if (userIds.length === 0) return [];
        
        return await notificationsService.createBulkNotifications(
            userIds,
            {
                type: "CARD_MOVED",
                message: `${data.movedByUserName} moved "${data.cardTitle}" from ${data.fromListName} to ${data.toListName}`,
                metadata: {
                    cardId: data.cardId,
                    boardId: data.boardId,
                    fromList: data.fromListName,
                    toList: data.toListName
                },
                actionUrl: `/boards/${data.boardId}/cards/${data.cardId}`
            }
        );
    }
}

export const notificationHelpers = new NotificationHelpers();
