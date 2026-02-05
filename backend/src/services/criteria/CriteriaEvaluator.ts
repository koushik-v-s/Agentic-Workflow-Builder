import { CompletionCriteria } from '../../types/workflow.types';
import RuleBasedEvaluator from './RuleBasedEvaluator';
import LLMJudgeEvaluator from './LLMJudgeEvaluator';
import logger from '../../config/logger';

export interface EvaluationResult {
    passed: boolean;
    reason: string;
    details?: any;
    cost?: number;
    tokensUsed?: number;
}

class CriteriaEvaluator {
    async evaluate(response: string, criteria: CompletionCriteria): Promise<EvaluationResult> {
        try {
            logger.info(`Evaluating criteria of type: ${criteria.type}`);

            switch (criteria.type) {
                case 'rule':
                    return await RuleBasedEvaluator.evaluate(response, criteria);

                case 'llm_judge':
                    return await LLMJudgeEvaluator.evaluate(response, criteria);

                case 'hybrid':
                    // Try primary first, fallback if inconclusive
                    const primaryResult = await this.evaluate(response, criteria.primary);
                    if (primaryResult.passed || primaryResult.details?.conclusive !== false) {
                        return primaryResult;
                    }
                    logger.info('Primary evaluation inconclusive, trying fallback');
                    return await this.evaluate(response, criteria.fallback);

                default:
                    logger.error(`Unknown criteria type: ${(criteria as any).type}`);
                    return {
                        passed: false,
                        reason: 'Unknown criteria type',
                    };
            }
        } catch (error: any) {
            logger.error('Error evaluating criteria:', error);
            return {
                passed: false,
                reason: `Evaluation error: ${error.message}`,
            };
        }
    }
}

export default new CriteriaEvaluator();
