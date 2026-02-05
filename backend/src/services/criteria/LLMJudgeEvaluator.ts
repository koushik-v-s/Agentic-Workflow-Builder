import { EvaluationResult } from './CriteriaEvaluator';
import UnboundAdapter from '../llm/UnboundAdapter';
import ModelRegistry from '../llm/ModelRegistry';
import logger from '../../config/logger';

interface LLMJudgeCriteria {
    type: 'llm_judge';
    judgeModel: string;
    judgePrompt: string;
    passKeywords?: string[];
    failKeywords?: string[];
}

class LLMJudgeEvaluator {
    async evaluate(response: string, criteria: LLMJudgeCriteria): Promise<EvaluationResult> {
        try {
            // Construct the judge prompt
            const fullPrompt = `${criteria.judgePrompt}\n\nResponse to evaluate:\n${response}`;

            // Call the LLM judge
            const judgeResponse = await UnboundAdapter.call({
                model: criteria.judgeModel,
                prompt: fullPrompt,
                temperature: 0.3, // Lower temperature for more consistent judgement
                maxTokens: 500,
            });

            const judgement = judgeResponse.text.toLowerCase();

            // Calculate cost
            const cost = await ModelRegistry.calculateCost(
                criteria.judgeModel,
                judgeResponse.tokensUsed.prompt,
                judgeResponse.tokensUsed.completion
            );

            // Check for pass/fail keywords
            let passed = false;
            let reason = '';

            if (criteria.passKeywords && criteria.passKeywords.length > 0) {
                const hasPassKeyword = criteria.passKeywords.some((keyword) =>
                    judgement.includes(keyword.toLowerCase())
                );

                if (hasPassKeyword) {
                    passed = true;
                    reason = `LLM judge passed: ${judgeResponse.text.substring(0, 200)}`;
                }
            }

            if (criteria.failKeywords && criteria.failKeywords.length > 0) {
                const hasFailKeyword = criteria.failKeywords.some((keyword) =>
                    judgement.includes(keyword.toLowerCase())
                );

                if (hasFailKeyword) {
                    passed = false;
                    reason = `LLM judge failed: ${judgeResponse.text.substring(0, 200)}`;
                }
            }

            // If no keywords configured, look for common pass/fail words
            if (!reason) {
                const passWords = ['yes', 'pass', 'success', 'correct', 'valid', 'good'];
                const failWords = ['no', 'fail', 'incorrect', 'invalid', 'bad', 'wrong'];

                const hasPassWord = passWords.some((word) => judgement.includes(word));
                const hasFailWord = failWords.some((word) => judgement.includes(word));

                if (hasPassWord && !hasFailWord) {
                    passed = true;
                    reason = `LLM judge passed: ${judgeResponse.text.substring(0, 200)}`;
                } else if (hasFailWord && !hasPassWord) {
                    passed = false;
                    reason = `LLM judge failed: ${judgeResponse.text.substring(0, 200)}`;
                } else {
                    // Inconclusive
                    passed = false;
                    reason = `LLM judge inconclusive: ${judgeResponse.text.substring(0, 200)}`;
                    logger.warn('LLM judge evaluation was inconclusive');
                }
            }

            return {
                passed,
                reason,
                cost,
                tokensUsed: judgeResponse.tokensUsed.total,
                details: {
                    fullJudgement: judgeResponse.text,
                    model: criteria.judgeModel,
                },
            };
        } catch (error: any) {
            logger.error('LLM judge evaluation error:', error);
            return {
                passed: false,
                reason: `LLM judge error: ${error.message}`,
            };
        }
    }
}

export default new LLMJudgeEvaluator();
