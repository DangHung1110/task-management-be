import dotenv from 'dotenv';

dotenv.config();

export const cacheConfig = {
    enabled: process.env.CACHE_ENABLED !== 'false',
    prefix: process.env.CACHE_PREFIX || 'task_management:',
    
    ttl: {
        default: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
        rbacPermissions: parseInt(process.env.CACHE_TTL_RBAC_PERMISSIONS || '7200'),
        userRoles: parseInt(process.env.CACHE_TTL_USER_ROLES || '3600'),
        userProfile: parseInt(process.env.CACHE_TTL_USER_PROFILE || '1800'),
        workspaceData: parseInt(process.env.CACHE_TTL_WORKSPACE_DATA || '600'),
        boardData: parseInt(process.env.CACHE_TTL_BOARD_DATA || '300'),
        listData: parseInt(process.env.CACHE_TTL_LIST_DATA || '300'),
        cardData: parseInt(process.env.CACHE_TTL_CARD_DATA || '300'),
    },
    
    keys: {
        rbacPermission: (resourceType: string, roleName: string, permission: string) => 
            `rbac:${resourceType}:${roleName}:${permission}`,
        userRoles: (userId: string) => `user:${userId}:roles`,
        userPermissions: (userId: string) => `user:${userId}:permissions`,
        userRolesAndPermissions: (userId: string) => `user:${userId}:roles_permissions`,
        workspaceById: (id: string) => `workspace:${id}`,
        workspacesList: (page: number, limit: number, search?: string) =>
            `workspaces:list:${page}:${limit}:${search || 'all'}`,
        boardById: (id: string) => `board:${id}`,
        boardsList: (page: number, limit: number, workspaceId?: string, search?: string) =>
            `boards:list:${page}:${limit}:${workspaceId || 'all'}:${search || 'all'}`,
        listById: (id: string) => `list:${id}`,
        listsList: (page: number, limit: number, boardId?: string, search?: string) =>
            `lists:list:${page}:${limit}:${boardId || 'all'}:${search || 'all'}`,
        cardById: (id: string) => `card:${id}`,
        cardsList: (page: number, limit: number, listId?: string, search?: string) =>
            `cards:list:${page}:${limit}:${listId || 'all'}:${search || 'all'}`,
    }
};

export type CacheConfig = typeof cacheConfig;
