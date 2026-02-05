import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import ExecutionEngine from '../services/execution/ExecutionEngine';
import { STATUS } from '../config/constants';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export class ExecutionController {
    async startExecution(req: Request, res: Response, next: NextFunction) {
        try {
            const { workflowId } = req.body;

            if (!workflowId) {
                return res.status(400).json({ success: false, error: 'workflowId is required' });
            }

            // Create execution record
            const execution = await prisma.workflowExecution.create({
                data: {
                    workflowId,
                    status: STATUS.WORKFLOW_EXECUTION.PENDING,
                    metadata: req.body.metadata || {},
                },
            });

            logger.info(`Created execution ${execution.id} for workflow ${workflowId}`);

            // Start execution asynchronously
            ExecutionEngine.executeWorkflow(workflowId, execution.id).catch((error) => {
                logger.error(`Execution ${execution.id} crashed:`, error);
            });

            res.status(201).json({
                success: true,
                data: execution,
            });
        } catch (error) {
            next(error);
        }
    }

    async getExecutionStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const execution = await prisma.workflowExecution.findUnique({
                where: { id },
                include: {
                    workflow: true,
                    stepExecutions: {
                        orderBy: { stepOrder: 'asc' },
                    },
                },
            });

            if (!execution) {
                return res.status(404).json({ success: false, error: 'Execution not found' });
            }

            res.json({ success: true, data: execution });
        } catch (error) {
            next(error);
        }
    }

    async cancelExecution(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            // For now, just mark as cancelled
            // In production, you'd need to actually stop the execution
            const execution = await prisma.workflowExecution.update({
                where: { id },
                data: {
                    status: STATUS.WORKFLOW_EXECUTION.CANCELLED,
                    completedAt: new Date(),
                },
            });

            logger.info(`Execution ${id} cancelled`);

            res.json({ success: true, data: execution });
        } catch (error) {
            next(error);
        }
    }

    async getExecutionLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const execution = await prisma.workflowExecution.findUnique({
                where: { id },
                include: {
                    stepExecutions: {
                        orderBy: { stepOrder: 'asc' },
                        include: {
                            step: true,
                        },
                    },
                },
            });

            if (!execution) {
                return res.status(404).json({ success: false, error: 'Execution not found' });
            }

            res.json({ success: true, data: execution });
        } catch (error) {
            next(error);
        }
    }

    async getExecutionHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { workflowId } = req.params;

            const executions = await prisma.workflowExecution.findMany({
                where: { workflowId },
                include: {
                    _count: {
                        select: { stepExecutions: true },
                    },
                },
                orderBy: { startedAt: 'desc' },
                take: 50,
            });

            res.json({ success: true, data: executions });
        } catch (error) {
            next(error);
        }
    }
}

export default new ExecutionController();
