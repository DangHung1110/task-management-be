import { redis } from '../../config/redis.config';
import { CacheMiddlewareOptions } from './cache.middleware';

export interface CacheOptions {
    ttl?: number; // time to live in seconds
    prefix?: string; // key prefix
    compress?: boolean; // whether to compress the data
}

export class CacheService {
    private defaultTTL: number;
    private prefix: string;

    constructor() {
        this.defaultTTL = parseInt(process.env.CACHE_DEFAULT_TTL || '3600'); // default to 1 hour
        this.prefix = process.env.CACHE_KEY_PREFIX || 'app_cache:';
    }

    // Generate cache key wwith prefix 
    private buildKey(key: string, prefix: string | undefined): string {
        const finalPrefix = this.prefix;
        return `${finalPrefix}${key}`;
    }

    // Get value from cache
    async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
        try {
            const cacheKey = this.buildKey(key, options?.prefix);
            const data = await redis.get(cacheKey);

            if (!data) {
                return null;
            }
            return JSON.parse(data) as T
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    // Set value in cache 
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const ttl = this.defaultTTL;
            const serialized = JSON.stringify(value);

            if (ttl > 0) {
                await redis.setex(fullKey, ttl, serialized);
            } else {
                await redis.set(fullKey, serialized);
            }
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    // Delete value from cache
    async delete(key: string, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            await redis.del(fullKey);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    // delete multiple keys matching pattern
    async deletePattern(pattern: string, options?: CacheOptions): Promise<number> {
        try {
            const fullPattern = this.buildKey(pattern, options?.prefix);
            const keys = await redis.keys(fullPattern);

            if (keys.length === 0) {
                return 0;
            }
            await redis.del(...keys);
            return keys.length;
        } catch (error) {
            console.error('Cache delete pattern error:', error);
            return 0;
        }
    }

    // check if key exists
    async exists(key: string, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const result = await redis.exists(fullKey);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    // set expiration time
    async expire(key: string, ttl: number, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const result = await redis.expire(fullKey, ttl);
            return result === 1;
        } catch (error) {
            console.error('Cache expire error:', error);
            return false;
        }
    }

    async ttl(key: string, options?: CacheOptions): Promise<number> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            return await redis.ttl(fullKey);
        } catch (error) {
            console.error(`Cache TTL error for key ${key}:`, error);
            return -1;
        }
    }

    // increment numeric value
    async increment(key: string, options?: CacheOptions): Promise<number> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            return await redis.incr(fullKey);
        } catch (error) {
            console.error(`Cache INCREMENT error for key ${key}:`, error);
            return 0;
        }
    }

    // Get from cache or set if not exists
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key, options);
        if (cached !== null) {
            return cached;
        }

        // Cache miss - fetch from source
        const value = await fetchFn();

        // Store in cache
        await this.set(key, value, options);

        return value;
    }

    // Hash operations
    async hset(key: string, field: string, value: any, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            await redis.hset(fullKey, field, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Cache HSET error:`, error);
            return false;
        }
    }

    async hget<T>(key: string, field: string, options?: CacheOptions): Promise<T | null> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const value = await redis.hget(fullKey, field);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Cache HGET error:`, error);
            return null;
        }
    }

    async hgetall<T>(key: string, options?: CacheOptions): Promise<T | null> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const hash = await redis.hgetall(fullKey);

            if (Object.keys(hash).length === 0) return null;

            const parsed: any = {};
            for (const [field, value] of Object.entries(hash)) {
                parsed[field] = JSON.parse(value as string);
            }

            return parsed as T;
        } catch (error) {
            console.error(`Cache HGETALL error:`, error);
            return null;
        }
    }

    // List operations
    async lpush<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            await redis.lpush(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Cache LPUSH error:`, error);
            return false;
        }
    }

    async lrange<T>(key: string, start: number, stop: number, options?: CacheOptions): Promise<T[]> {
        try {
            const fullKey = this.buildKey(key, options?.prefix);
            const values = await redis.lrange(fullKey, start, stop);
            return values.map((v: string) => JSON.parse(v));
        } catch (error) {
            console.error(`Cache LRANGE error:`, error);
            return [];
        }
    }

    
    // Clear all cache
    async flush(): Promise<boolean> {
        try {
            await redis.flushdb();
            return true;
        } catch (error) {
            console.error('Cache FLUSH error:', error);
            return false;
        }
    }
}

export const cacheService = new CacheService();
