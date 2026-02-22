import { cacheService, CacheOptions } from './cache.service';

export interface CacheableOptions extends CacheOptions {
    keyPrefix?: string;
    keyGenerator?: (...args: any[]) => string;
}

export function Cacheable(options: CacheableOptions = {}) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            let cacheKey: string;
            
            if (options.keyGenerator) {
                cacheKey = options.keyGenerator(...args);
            } else {
                const baseKey = options.keyPrefix || `${target.constructor.name}:${propertyKey}`;
                if (args.length > 0) {
                    const argsKey = JSON.stringify(args);
                    cacheKey = `${baseKey}:${argsKey}`;
                } else {
                    cacheKey = baseKey;
                }
            }
            
            const cached = await cacheService.get(cacheKey, options);
            if(cached !== null) {
                return cached;
            }
            
            const result = await originalMethod.apply(this, args);
            await cacheService.set(cacheKey, result, options);
            return result;
        }
        return descriptor;
    }
}

export function CacheEvict(pattern: string, options?: CacheOptions) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);
            
            try {
                const deleted = await cacheService.deletePattern(pattern, options);
                console.log(`[Cache Evict] Deleted ${deleted} keys matching: ${pattern}`);
            } catch (error) {
                console.error(`[Cache Evict] Error deleting pattern ${pattern}:`, error);
            }
            
            return result;
        }
        return descriptor;
    }
}