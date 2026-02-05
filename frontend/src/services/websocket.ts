import { io, Socket } from 'socket.io-client';
import { ExecutionProgress } from '../types/workflow.types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class WebSocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('execution:progress', (progress: ExecutionProgress) => {
            this.emit('execution:progress', progress);
        });

        this.socket.on('execution:update', (update: any) => {
            this.emit('execution:update', update);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinExecution(executionId: string) {
        if (this.socket) {
            this.socket.emit('join:execution', executionId);
        }
    }

    leaveExecution(executionId: string) {
        if (this.socket) {
            this.socket.emit('leave:execution', executionId);
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, data: any) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach((callback) => callback(data));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new WebSocketService();
