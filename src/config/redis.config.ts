import Redis, {RedisOptions} from "ioredis";
import dotevn from "dotenv";
import { th } from "zod/v4/locales";
import e from "cors";
dotevn.config();

export const redisConfig: RedisOptions = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },

    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    lazyConnect: false,
    keepAlive: 30000,
    connectionName: 'task-management-app',
    connectTimeout: 10000,
};

export class RedisClient {
    private static instance: Redis | null;
    private static subInstance: Redis | null;

    static  getInstance(): Redis {
        if(!this.instance) {
            this.instance = new Redis(redisConfig);
        
            this.instance.on('connect', ()=> {
                console.log('Redis client connected');  
            })

            this.instance.on('error',(err) => {
                console.error('Redis connection error:', err);
            })

            this.instance.on('close',() => {
                console.log('Redis connection closed');
            })

            this.instance.on('reconnecting',() => {
                console.log('Redis reconnecting...');
            })
        }
        return this.instance; 
    }

    static getSubInstance(): Redis {
        if(!this.subInstance) {
            this.subInstance = new Redis(redisConfig);
            this.subInstance.on('connect', ()=> {
                console.log('Redis subscriber client connected');  
            })
        }
        return this.subInstance;
    }

    static async disconnect(): Promise<void> {
        if(this.instance) {
            await this.instance.quit();
            this.instance = null;
        }
        if(this.subInstance) {
            await this.subInstance.quit();
            this.subInstance = null;
        }
    }

    static async ping(): Promise<boolean> {
        try {
            const result = await this.getInstance().ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Redis ping error:', error);
            return false;
        }
    }
}

export const redis = RedisClient.getInstance();
export const redisSub = RedisClient.getSubInstance();