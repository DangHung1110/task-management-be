import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { pubSubService } from "../../common/pubsub/pubsub.service";
import { PUBSUB_CHANNELS } from "../../common/pubsub/events";

export class NotificationsGateway {
    constructor(
        private server: Server | null = null,
        private readonly connectedUsers = new Map<string, Set<string>>(),
        private readonly socketToUser = new Map<string, string>()
    ) {}

    initialize(httpServer: HTTPServer) {
        this.server = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:5173",
                credentials: true
            }
        });
        
        this.server.use((socket, next) => {
            socket.data.userId = socket.handshake.query.userId || "123456";
            next();
        });
        
        this.server.on("connection", (socket) => this.handleConnection(socket));
        this.setupPubSubSubscriptions();
        
        console.log("Socket.IO server initialized");
    }
    
    private setupPubSubSubscriptions() {
        pubSubService.subscribe(
            PUBSUB_CHANNELS.NOTIFICATION_CREATED,
            async (data) => {
                const { notification } = data;
                await this.sendMessageToUser(notification.userId, {
                    event: 'new_notification',
                    data: notification
                });
            }
        );
        
        console.log("Pub/Sub subscriptions established");
    }

    async handleConnection(client: Socket) {
        const userId = client.data.userId as string;
        console.log(`User connected: ${userId} with socket ID: ${client.id}`);
        
        this.connectedUsers.set(
            userId,
            this.connectedUsers.get(userId) 
                ? this.connectedUsers.get(userId)!.add(client.id) 
                : new Set([client.id])
        );
        this.socketToUser.set(client.id, userId);
        
        await pubSubService.publish(PUBSUB_CHANNELS.USER_ONLINE, {
            userId,
            socketId: client.id,
            timestamp: new Date()
        });

        client.on("disconnect", () => this.handleDisconnect(client)); 
    }

    async handleDisconnect(client: Socket) {
        const userId = this.socketToUser.get(client.id);
        
        if (userId) {
            const sockets = this.connectedUsers.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                
                if (sockets.size === 0) {
                    this.connectedUsers.delete(userId);
                    
                    await pubSubService.publish(PUBSUB_CHANNELS.USER_OFFLINE, {
                        userId,
                        timestamp: new Date()
                    });
                }
            }
            
            this.socketToUser.delete(client.id);
        }
        
        console.log(`User disconnected: socket ${client.id}`);
    }

    async sendMessageToUser<T>(userId: string, message: T) {
        const socketIds = this.connectedUsers.get(userId);
        if (socketIds && this.server) {
            for (const socketId of socketIds) {
                this.server.to(socketId).emit("notification", message);
            }
            return true;
        }
        return false;
    }
    
    async broadcastToAll<T>(event: string, message: T) {
        if (this.server) {
            this.server.emit(event, message);
        }
    }
    
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }
    
    getOnlineUsersCount(): number {
        return this.connectedUsers.size;
    }
}

export default new NotificationsGateway();  