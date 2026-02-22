import { redis, redisSub} from '../../config/redis.config';

export type EventHandler = (data: any) => void;

export class PubSubService {
    private handlers: Map<string, EventHandler[]> = new Map();

    constructor() {
        this.setupSub();
    }

    private setupSub() {
        redisSub.on('message', async (channel: string, message: string) => {
            const handlers = this.handlers.get(channel);
            if( !handlers ) return;
            
            try {
                const data = JSON.parse(message);

                // Execute all handlers concurrently
                await Promise.all(
                    handlers.map( handler => handler(data) )
                );
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });
    }

    async publish(channel: string, data: any): Promise<void> {
        try { 
            await redis.publish(channel, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to publish message:', error); 
        }
    }

    async subscribe(channel: string, handler: EventHandler): Promise<void> {
        try {
            const handlers = this.handlers.get(channel) || [];
            handlers.push(handler);
            this.handlers.set(channel, handlers);

            // Subscribe to the channel if this is the first handler
            if (handlers.length === 1) {
                await redisSub.subscribe(channel);
                console.log(`Subscribed to channel: ${channel}`);
            }
        } catch (error) {
            console.error('Failed to subscribe to channel:', error); 
        }
    } 

    async unsubscribe(channel: string, handler: EventHandler): Promise<void> {
        try {
            await redisSub.unsubscribe(channel);
            this.handlers.delete(channel);
            console.log(`Unsubscribed from channel: ${channel}`);
        } catch (error) {
            console.error('Failed to unsubscribe from channel:', error);    
        }
    }
}

export const pubSubService = new PubSubService();