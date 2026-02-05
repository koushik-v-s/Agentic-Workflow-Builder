import prisma from '../../config/database';
import { CreateWorkflowInput, UpdateWorkflowInput } from '../../types/workflow.types';
import logger from '../../config/logger';

export class WorkflowService {
    async getAllWorkflows() {
        return prisma.workflow.findMany({
            include: {
                steps: {
                    orderBy: { stepOrder: 'asc' },
                },
                _count: {
                    select: { executions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getWorkflowById(id: string) {
        return prisma.workflow.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { stepOrder: 'asc' },
                },
                executions: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async createWorkflow(data: CreateWorkflowInput) {
        logger.info(`Creating workflow: ${data.name}`);

        return prisma.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                retryBudget: data.retryBudget,
                costBudget: data.costBudget,
            },
            include: {
                steps: true,
            },
        });
    }

    async updateWorkflow(id: string, data: UpdateWorkflowInput) {
        logger.info(`Updating workflow: ${id}`);

        return prisma.workflow.update({
            where: { id },
            data,
            include: {
                steps: {
                    orderBy: { stepOrder: 'asc' },
                },
            },
        });
    }

    async deleteWorkflow(id: string) {
        logger.info(`Deleting workflow: ${id}`);

        return prisma.workflow.delete({
            where: { id },
        });
    }

    async duplicateWorkflow(id: string) {
        const original = await prisma.workflow.findUnique({
            where: { id },
            include: { steps: true },
        });

        if (!original) {
            throw new Error('Workflow not found');
        }

        logger.info(`Duplicating workflow: ${original.name}`);

        return prisma.workflow.create({
            data: {
                name: `${original.name} (Copy)`,
                description: original.description,
                retryBudget: original.retryBudget,
                costBudget: original.costBudget,
                steps: {
                    create: original.steps.map((step) => ({
                        stepOrder: step.stepOrder,
                        name: step.name,
                        modelId: step.modelId,
                        promptTemplate: step.promptTemplate,
                        completionCriteria: step.completionCriteria,
                        retryLimit: step.retryLimit,
                        contextMode: step.contextMode,
                        contextSelector: step.contextSelector,
                    })),
                },
            },
            include: {
                steps: true,
            },
        });
    }
}

export default new WorkflowService();
