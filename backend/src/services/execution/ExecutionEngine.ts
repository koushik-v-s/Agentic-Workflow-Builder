import prisma from '../../config/database';
import StepExecutor from './StepExecutor';
import ContextManager from './ContextManager';
import { STATUS } from '../../config/constants';
import logger from '../../config/logger';
import { EventEmitter } from 'events';

export interface ExecutionProgress {
    executionId: string;
    status: string;
    currentStep?: number;
    totalSteps: number;
    completedSteps: number;
    totalCost: number;
    totalTokens: number;
    error?: string;
}

class ExecutionEngine extends EventEmitter {
    async executeWorkflow(workflowId: string, executionId: string): Promise<void> {
        try {
            // Get workflow with all steps
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
                include: {
                    steps: {
                        orderBy: { stepOrder: 'asc' },
                    },
                },
            });

            if (!workflow) {
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            if (!workflow.steps || workflow.steps.length === 0) {
                throw new Error('Workflow has no steps');
            }

            logger.info(`🚀 Starting workflow execution: ${workflow.name} (${executionId})`);

            // Update execution status
            await prisma.workflowExecution.update({
                where: { id: executionId },
                data: {
                    status: STATUS.WORKFLOW_EXECUTION.RUNNING,
                },
            });

            this.emitProgress(executionId, {
                executionId,
                status: STATUS.WORKFLOW_EXECUTION.RUNNING,
                currentStep: 0,
                totalSteps: workflow.steps.length,
                completedSteps: 0,
                totalCost: 0,
                totalTokens: 0,
            });

            let totalCost = 0;
            let totalTokens = 0;
            let previousContext = '';
            const allOutputs: Array<{ stepOrder: number; output: string }> = [];

            // Execute steps sequentially
            for (const step of workflow.steps) {
                logger.info(`\n📝 Executing step ${step.stepOrder}: ${step.name}`);

                this.emitProgress(executionId, {
                    executionId,
                    status: STATUS.WORKFLOW_EXECUTION.RUNNING,
                    currentStep: step.stepOrder,
                    totalSteps: workflow.steps.length,
                    completedSteps: step.stepOrder - 1,
                    totalCost,
                    totalTokens,
                });

                // Execute the step
                const result = await StepExecutor.executeStep(
                    executionId,
                    step,
                    previousContext,
                    allOutputs
                );

                totalCost += result.cost;
                totalTokens += result.tokensUsed;

                // Check budget
                if (workflow.costBudget && totalCost > parseFloat(workflow.costBudget.toString())) {
                    const errorMsg = `Cost budget exceeded: $${totalCost.toFixed(4)} > $${workflow.costBudget}`;
                    logger.error(errorMsg);

                    await prisma.workflowExecution.update({
                        where: { id: executionId },
                        data: {
                            status: STATUS.WORKFLOW_EXECUTION.FAILED,
                            completedAt: new Date(),
                            totalCost,
                            totalTokens,
                            errorMessage: errorMsg,
                        },
                    });

                    this.emitProgress(executionId, {
                        executionId,
                        status: STATUS.WORKFLOW_EXECUTION.FAILED,
                        currentStep: step.stepOrder,
                        totalSteps: workflow.steps.length,
                        completedSteps: step.stepOrder - 1,
                        totalCost,
                        totalTokens,
                        error: errorMsg,
                    });

                    return;
                }

                if (!result.success) {
                    // Step failed
                    logger.error(`❌ Step ${step.stepOrder} failed: ${result.error}`);

                    await prisma.workflowExecution.update({
                        where: { id: executionId },
                        data: {
                            status: STATUS.WORKFLOW_EXECUTION.FAILED,
                            completedAt: new Date(),
                            totalCost,
                            totalTokens,
                            errorMessage: `Step ${step.stepOrder} (${step.name}) failed: ${result.error}`,
                        },
                    });

                    this.emitProgress(executionId, {
                        executionId,
                        status: STATUS.WORKFLOW_EXECUTION.FAILED,
                        currentStep: step.stepOrder,
                        totalSteps: workflow.steps.length,
                        completedSteps: step.stepOrder - 1,
                        totalCost,
                        totalTokens,
                        error: result.error,
                    });

                    return;
                }

                // Step succeeded - extract context for next step
                if (result.response) {
                    allOutputs.push({
                        stepOrder: step.stepOrder,
                        output: result.response,
                    });

                    previousContext = ContextManager.extractContext(
                        result.response,
                        step.contextMode,
                        step.contextSelector || undefined
                    );

                    logger.info(`✅ Step ${step.stepOrder} completed (${result.retries} retries)`);
                }
            }

            // All steps completed successfully
            await prisma.workflowExecution.update({
                where: { id: executionId },
                data: {
                    status: STATUS.WORKFLOW_EXECUTION.COMPLETED,
                    completedAt: new Date(),
                    totalCost,
                    totalTokens,
                },
            });

            this.emitProgress(executionId, {
                executionId,
                status: STATUS.WORKFLOW_EXECUTION.COMPLETED,
                totalSteps: workflow.steps.length,
                completedSteps: workflow.steps.length,
                totalCost,
                totalTokens,
            });

            logger.info(
                `\n🎉 Workflow completed successfully! Cost: $${totalCost.toFixed(4)}, Tokens: ${totalTokens}\n`
            );
        } catch (error: any) {
            logger.error('Workflow execution error:', error);

            await prisma.workflowExecution.update({
                where: { id: executionId },
                data: {
                    status: STATUS.WORKFLOW_EXECUTION.FAILED,
                    completedAt: new Date(),
                    errorMessage: error.message,
                },
            });

            this.emitProgress(executionId, {
                executionId,
                status: STATUS.WORKFLOW_EXECUTION.FAILED,
                totalSteps: 0,
                completedSteps: 0,
                totalCost: 0,
                totalTokens: 0,
                error: error.message,
            });
        }
    }

    private emitProgress(executionId: string, progress: ExecutionProgress): void {
        this.emit('execution:progress', progress);
    }
}

export default new ExecutionEngine();
