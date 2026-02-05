import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.errors,
        });
    }

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: 'Resource already exists',
            details: err.meta,
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'Resource not found',
        });
    }

    // Generic errors
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
    });
}
