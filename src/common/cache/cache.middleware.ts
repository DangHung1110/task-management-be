import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheOptions } from './cache.service';

export interface CacheMiddlewareOptions extends CacheOptions {
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request) => boolean;
}

export const cacheMiddleware = (options?: CacheMiddlewareOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if(req.method !== 'GET') {
            return next();
        }

        try {
            const cacheKey = options?.keyGenerator ? options.keyGenerator(req) : `route:${req.originalUrl}`;
            
            if (options?.condition && !options.condition(req)) {
                return next();
            }
            
            const cached = await cacheService.get<any>(cacheKey, options);

            if (cached !== null && cached !== undefined) {
                return res.json(cached);
            }

            const originalJson = res.json.bind(res);
            res.json = function(data: any) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    Promise.resolve(cacheService.set(cacheKey, data, options)).catch(err => {
                        console.error('Cache set error in middleware:', err);
                    });
                }
                return originalJson(data);
            };
            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

export const invalidateCacheMiddleware = (pattern: string, options?: CacheOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.on('finish', () => {
                if(res.statusCode >= 200 && res.statusCode < 300) {
                    cacheService.deletePattern(pattern, options).catch(err => {
                        console.error('Cache invalidate error in middleware:', err);
                    });
                }
            });

            next();
        } catch (error) {
            console.error('Cache invalidate middleware error:', error);
            next();
        }
    }
}