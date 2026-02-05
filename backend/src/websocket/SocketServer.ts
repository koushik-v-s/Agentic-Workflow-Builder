import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import ExecutionEngine from '../services/execution/ExecutionEngine';
import logger from '../config/logger';
import { APP_CONFIG } from '../config/constants';

export class SocketServer {
    private io: SocketIOServer;

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: APP_CONFIG.ALLOWED_ORIGINS,
                credentials: true,
            },
        });

        this.setupEventHandlers();
        logger.info(`✅ WebSocket server initialized on port ${APP_CONFIG.WS_PORT}`);
    }

    private setupEventHandlers() {
        // Listen to execution progress from ExecutionEngine
        ExecutionEngine.on('execution:progress', (progress) => {
            this.broadcastExecutionProgress(progress);
        });

        // Handle socket connections
        this.io.on('connection', (socket) => {
            logger.info(`WebSocket client connected: ${socket.id}`);

            // Join execution room
            socket.on('join:execution', (executionId: string) => {
                socket.join(`execution:${executionId}`);
                logger.debug(`Client ${socket.id} joined execution room: ${executionId}`);
            });

            // Leave execution room
            socket.on('leave:execution', (executionId: string) => {
                socket.leave(`execution:${executionId}`);
                logger.debug(`Client ${socket.id} left execution room: ${executionId}`);
            });

            socket.on('disconnect', () => {
                logger.info(`WebSocket client disconnected: ${socket.id}`);
            });
        });
    }

    private broadcastExecutionProgress(progress: any) {
        // Broadcast to specific execution room
        this.io.to(`execution:${progress.executionId}`).emit('execution:progress', progress);

        // Also broadcast to general channel for dashboard
        this.io.emit('execution:update', progress);

        logger.debug(`Broadcasted execution progress: ${progress.executionId} - ${progress.status}`);
    }

    getIO(): SocketIOServer {
        return this.io;
    }
}

let socketServer: SocketServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): SocketServer {
    if (!socketServer) {
        socketServer = new SocketServer(httpServer);
    }
    return socketServer;
}

export function getSocketServer(): SocketServer | null {
    return socketServer;
}
