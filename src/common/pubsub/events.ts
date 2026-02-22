export const PUBSUB_CHANNELS = {
    NOTIFICATION_CREATED: 'notifications:created',
    NOTIFICATION_READ: 'notifications:read',
    NOTIFICATION_DELETED: 'notifications:deleted',
    
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    
    WORKSPACE_UPDATED: 'workspace:updated',
    WORKSPACE_MEMBER_ADDED: 'workspace:member:added',
    WORKSPACE_MEMBER_REMOVED: 'workspace:member:removed',
    
    BOARD_UPDATED: 'board:updated',
    BOARD_MEMBER_ADDED: 'board:member:added',
    CARD_UPDATED: 'card:updated',
    
    CACHE_INVALIDATE: 'cache:invalidate',
    CACHE_INVALIDATE_RBAC: 'cache:invalidate:rbac',
} as const;

export type PubSubChannel = typeof PUBSUB_CHANNELS[keyof typeof PUBSUB_CHANNELS];

export interface NotificationCreatedEvent {
    notification: {
        id: string;
        userId: string;
        type: string;
        message: string;
        [key: string]: any;
    };
}

export interface CacheInvalidateEvent {
    pattern: string;
    reason?: string;
}

export interface UserStatusEvent {
    userId: string;
    socketId?: string;
    timestamp: Date;
}
