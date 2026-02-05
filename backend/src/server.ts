import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { APP_CONFIG } from './config/constants';
import { initializeSocketServer } from './websocket/SocketServer';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import logger from './config/logger';
import prisma from './config/database';
import redis from './config/redis';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server for WebSocket
const httpServer = createServer(app);

// Initialize WebSocket server
const socketServer = initializeSocketServer(httpServer);

// Middleware
app.use(cors({
    origin: APP_CONFIG.ALLOWED_ORIGINS,
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Agentic Workflow Builder API',
        version: '1.0.0',
        status: 'running',
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('✅ Database connected');

        // Test Redis connection
        await redis.ping();
        logger.info('✅ Redis connected');

        // Start HTTP server
        httpServer.listen(APP_CONFIG.PORT, () => {
            logger.info(`\n🚀 Server running on http://${APP_CONFIG.HOST}:${APP_CONFIG.PORT}`);
            logger.info(`📡 WebSocket server ready on port ${APP_CONFIG.PORT}`);
            logger.info(`🌍 Environment: ${APP_CONFIG.NODE_ENV}\n`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('\nSIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
});

// Start the server
startServer();
