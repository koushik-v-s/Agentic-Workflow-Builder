import prisma from '../../config/database';
import { WorkflowStep } from '@prisma/client';
import UnboundAdapter from '../llm/UnboundAdapter';
import ModelRegistry from '../llm/ModelRegistry';
import CriteriaEvaluator from '../criteria/CriteriaEvaluator';
import ContextManager from './ContextManager';
import { EXECUTION_CONFIG, STATUS } from '../../config/constants';
import logger from '../../config/logger';
import { CompletionCriteria } from '../../types/workflow.types';

interface StepExecutionResult {
    success: boolean;
    response?: string;
    cost: number;
    tokensUsed: number;
    retries: number;
    error?: string;
    completionCheck?: any;
}

export class StepExecutor {
    async executeStep(
        executionId: string,
        step: WorkflowStep,
        contextFromPrevious: string,
        allPreviousOutputs: Array<{ stepOrder: number; output: string }>
    ): Promise<StepExecutionResult> {
        let retryCount = 0;
        const maxRetries = step.retryLimit || EXECUTION_CONFIG.DEFAULT_RETRY_LIMIT;
        let totalCost = 0;
        let totalTokens = 0;

        // Create step execution record
        const stepExecution = await prisma.stepExecution.create({
            data: {
                executionId,
                stepId: step.id,
                stepOrder: step.stepOrder,
                status: STATUS.STEP_EXECUTION.RUNNING,
                promptSent: '',
                contextUsed: contextFromPrevious,
            },
        });

        try {
            while (retryCount <= maxRetries) {
                // Construct prompt with context
                const prompt = ContextManager.injectContext(
                    step.promptTemplate,
                    contextFromPrevious,
                    allPreviousOutputs
                );

                // Update step execution with prompt
                await prisma.stepExecution.update({
                    where: { id: stepExecution.id },
                    data: {
                        promptSent: prompt,
                        retryCount,
                        status: retryCount > 0 ? STATUS.STEP_EXECUTION.RETRYING : STATUS.STEP_EXECUTION.RUNNING,
                        startedAt: retryCount === 0 ? new Date() : undefined,
                    },
                });

                logger.info(
                    `Executing step ${step.stepOrder} (${step.name}) - Attempt ${retryCount + 1}/${maxRetries + 1}`
                );

                try {
                    // Call LLM
                    const llmResponse = await UnboundAdapter.call({
                        model: step.modelId,
                        prompt,
                    });

                    // Calculate cost
                    const cost = await ModelRegistry.calculateCost(
                        step.modelId,
                        llmResponse.tokensUsed.prompt,
                        llmResponse.tokensUsed.completion
                    );

                    totalCost += cost;
                    totalTokens += llmResponse.tokensUsed.total;

                    // Evaluate completion criteria
                    const evaluation = await CriteriaEvaluator.evaluate(
                        llmResponse.text,
                        step.completionCriteria as CompletionCriteria
                    );

                    // Add LLM judge cost if applicable
                    if (evaluation.cost) {
                        totalCost += evaluation.cost;
                    }
                    if (evaluation.tokensUsed) {
                        totalTokens += evaluation.tokensUsed;
                    }

                    if (evaluation.passed) {
                        // Success!
                        await prisma.stepExecution.update({
                            where: { id: stepExecution.id },
                            data: {
                                status: STATUS.STEP_EXECUTION.COMPLETED,
                                responseReceived: llmResponse.text,
                                completionCheck: evaluation,
                                completedAt: new Date(),
                                cost: totalCost,
                                tokensUsed: totalTokens,
                            },
                        });

                        logger.info(`✅ Step ${step.stepOrder} completed successfully`);

                        return {
                            success: true,
                            response: llmResponse.text,
                            cost: totalCost,
                            tokensUsed: totalTokens,
                            retries: retryCount,
                            completionCheck: evaluation,
                        };
                    } else {
                        // Criteria not met
                        logger.warn(`Step ${step.stepOrder} failed criteria: ${evaluation.reason}`);

                        if (retryCount >= maxRetries) {
                            // Max retries exceeded
                            const errorMsg = `Completion criteria not met after ${retryCount + 1} attempts: ${evaluation.reason}`;

                            await prisma.stepExecution.update({
                                where: { id: stepExecution.id },
                                data: {
                                    status: STATUS.STEP_EXECUTION.FAILED,
                                    responseReceived: llmResponse.text,
                                    completionCheck: evaluation,
                                    completedAt: new Date(),
                                    cost: totalCost,
                                    tokensUsed: totalTokens,
                                    errorMessage: errorMsg,
                                },
                            });

                            return {
                                success: false,
                                cost: totalCost,
                                tokensUsed: totalTokens,
                                retries: retryCount,
                                error: errorMsg,
                                completionCheck: evaluation,
                            };
                        }

                        // Retry with backoff
                        retryCount++;
                        const backoffMs = Math.pow(2, retryCount) * EXECUTION_CONFIG.RETRY_BACKOFF_BASE_MS;
                        logger.info(`Retrying step ${step.stepOrder} after ${backoffMs}ms...`);
                        await this.sleep(backoffMs);
                    }
                } catch (error: any) {
                    logger.error(`LLM call error on step ${step.stepOrder}:`, error);

                    if (retryCount >= maxRetries) {
                        // Max retries exceeded
                        const errorMsg = `LLM call failed after ${retryCount + 1} attempts: ${error.message}`;

                        await prisma.stepExecution.update({
                            where: { id: stepExecution.id },
                            data: {
                                status: STATUS.STEP_EXECUTION.FAILED,
                                completedAt: new Date(),
                                cost: totalCost,
                                tokensUsed: totalTokens,
                                errorMessage: errorMsg,
                            },
                        });

                        return {
                            success: false,
                            cost: totalCost,
                            tokensUsed: totalTokens,
                            retries: retryCount,
                            error: errorMsg,
                        };
                    }

                    // Retry
                    retryCount++;
                    const backoffMs = Math.pow(2, retryCount) * EXECUTION_CONFIG.RETRY_BACKOFF_BASE_MS;
                    await this.sleep(backoffMs);
                }
            }

            // Should not reach here, but just in case
            throw new Error('Unexpected execution path');
        } catch (error: any) {
            logger.error(`Fatal error executing step ${step.stepOrder}:`, error);

            await prisma.stepExecution.update({
                where: { id: stepExecution.id },
                data: {
                    status: STATUS.STEP_EXECUTION.FAILED,
                    completedAt: new Date(),
                    cost: totalCost,
                    tokensUsed: totalTokens,
                    errorMessage: error.message,
                },
            });

            return {
                success: false,
                cost: totalCost,
                tokensUsed: totalTokens,
                retries: retryCount,
                error: error.message,
            };
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export default new StepExecutor();
