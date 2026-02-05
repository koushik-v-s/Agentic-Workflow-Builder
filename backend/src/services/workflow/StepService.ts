import prisma from '../../config/database';
import { CreateStepInput, UpdateStepInput } from '../../types/workflow.types';
import logger from '../../config/logger';

export class StepService {
    async createStep(workflowId: string, data: CreateStepInput) {
        logger.info(`Creating step for workflow ${workflowId}`);

        return prisma.workflowStep.create({
            data: {
                workflowId,
                ...data,
            },
        });
    }

    async updateStep(stepId: string, data: UpdateStepInput) {
        logger.info(`Updating step: ${stepId}`);

        return prisma.workflowStep.update({
            where: { id: stepId },
            data,
        });
    }

    async deleteStep(stepId: string) {
        logger.info(`Deleting step: ${stepId}`);

        return prisma.workflowStep.delete({
            where: { id: stepId },
        });
    }

    async reorderSteps(workflowId: string, stepOrders: Array<{ id: string; order: number }>) {
        logger.info(`Reordering steps for workflow ${workflowId}`);

        const updates = stepOrders.map((item) =>
            prisma.workflowStep.update({
                where: { id: item.id },
                data: { stepOrder: item.order },
            })
        );

        await prisma.$transaction(updates);

        return prisma.workflowStep.findMany({
            where: { workflowId },
            orderBy: { stepOrder: 'asc' },
        });
    }
}

export default new StepService();
