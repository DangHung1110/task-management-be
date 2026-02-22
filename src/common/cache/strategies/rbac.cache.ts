import { cacheService } from '../cache.service';
import { AppDataSource } from '../../../config';
import { ResourcePermission } from '../../../entities/Role';
import { cacheConfig } from '../../../config/cache.config';

export class RBACCacheService {
    private readonly TTL = cacheConfig.ttl.rbacPermissions;
    
    async getPermission(
        resourceType: 'workspace' | 'board',
        roleName: string,
        permissionName: string
    ): Promise<boolean | null> {
        const cacheKey = cacheConfig.keys.rbacPermission(
            resourceType, 
            roleName, 
            permissionName
        );
        
        const cached = await cacheService.get<boolean>(cacheKey);
        if (cached !== null) {
            return cached;
        }
        
        const resourcePermRepo = AppDataSource.getRepository(ResourcePermission);
        const permission = await resourcePermRepo.findOne({
            where: {
                resourceType,
                roleName: roleName.toLowerCase(),
                permissionName
            }
        });
        
        if (!permission) {
            return null;
        }
        
        await cacheService.set(cacheKey, permission.isGranted, {
            ttl: this.TTL
        });
        
        return permission.isGranted;
    }
    
    async preloadAllPermissions(): Promise<number> {
        console.log('[RBAC Cache] Preloading all permissions...');
        
        const resourcePermRepo = AppDataSource.getRepository(ResourcePermission);
        const allPermissions = await resourcePermRepo.find();
        
        let count = 0;
        for (const perm of allPermissions) {
            const cacheKey = cacheConfig.keys.rbacPermission(
                perm.resourceType as 'workspace' | 'board',
                perm.roleName,
                perm.permissionName
            );
            
            await cacheService.set(cacheKey, perm.isGranted, {
                ttl: this.TTL
            });
            count++;
        }
        
        console.log(`[RBAC Cache] Preloaded ${count} permissions`);
        return count;
    }
    
    async invalidateAll(): Promise<number> {
        console.log('[RBAC Cache] Invalidating all RBAC permissions...');
        const pattern = 'rbac:*';
        return await cacheService.deletePattern(pattern);
    }
    
    async invalidateResourceType(resourceType: 'workspace' | 'board'): Promise<number> {
        const pattern = `rbac:${resourceType}:*`;
        return await cacheService.deletePattern(pattern);
    }
    
    async invalidateRole(
        resourceType: 'workspace' | 'board',
        roleName: string
    ): Promise<number> {
        const pattern = `rbac:${resourceType}:${roleName}:*`;
        return await cacheService.deletePattern(pattern);
    }
    
    async getRolePermissions(
        resourceType: 'workspace' | 'board',
        roleName: string
    ): Promise<Record<string, boolean>> {
        const resourcePermRepo = AppDataSource.getRepository(ResourcePermission);
        const permissions = await resourcePermRepo.find({
            where: {
                resourceType,
                roleName: roleName.toLowerCase()
            }
        });
        
        const result: Record<string, boolean> = {};
        
        for (const perm of permissions) {
            const cacheKey = cacheConfig.keys.rbacPermission(
                resourceType,
                roleName,
                perm.permissionName
            );
            
            await cacheService.set(cacheKey, perm.isGranted, {
                ttl: this.TTL
            });
            
            result[perm.permissionName] = perm.isGranted;
        }
        
        return result;
    }
}

export const rbacCacheService = new RBACCacheService();
