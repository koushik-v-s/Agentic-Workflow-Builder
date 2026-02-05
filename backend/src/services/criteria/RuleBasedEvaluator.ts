import { EvaluationResult } from './CriteriaEvaluator';
import logger from '../../config/logger';

interface RuleCriteria {
    type: 'rule';
    rules: Array<{
        type: string;
        value?: string | number;
        pattern?: string;
        language?: string;
        caseSensitive?: boolean;
    }>;
    logic: 'AND' | 'OR';
}

class RuleBasedEvaluator {
    async evaluate(response: string, criteria: RuleCriteria): Promise<EvaluationResult> {
        const results: Array<{ passed: boolean; reason: string }> = [];

        for (const rule of criteria.rules) {
            const result = this.evaluateRule(response, rule);
            results.push(result);

            // Short-circuit for AND logic
            if (criteria.logic === 'AND' && !result.passed) {
                return {
                    passed: false,
                    reason: result.reason,
                    details: { failedRule: rule, allResults: results },
                };
            }

            // Short-circuit for OR logic
            if (criteria.logic === 'OR' && result.passed) {
                return {
                    passed: true,
                    reason: result.reason,
                    details: { passedRule: rule, allResults: results },
                };
            }
        }

        // Final evaluation
        const allPassed = results.every((r) => r.passed);
        const anyPassed = results.some((r) => r.passed);

        const passed = criteria.logic === 'AND' ? allPassed : anyPassed;

        return {
            passed,
            reason: passed
                ? `All ${criteria.logic} criteria met`
                : `Not all ${criteria.logic} criteria met`,
            details: { allResults: results },
        };
    }

    private evaluateRule(
        response: string,
        rule: RuleCriteria['rules'][0]
    ): { passed: boolean; reason: string } {
        try {
            switch (rule.type) {
                case 'contains':
                    return this.checkContains(response, rule.value as string, rule.caseSensitive);

                case 'notContains':
                    const containsResult = this.checkContains(response, rule.value as string, rule.caseSensitive);
                    return {
                        passed: !containsResult.passed,
                        reason: containsResult.passed
                            ? `Response should not contain "${rule.value}"`
                            : `Response does not contain "${rule.value}"`,
                    };

                case 'regex':
                    return this.checkRegex(response, rule.pattern!);

                case 'minLength':
                    return this.checkMinLength(response, rule.value as number);

                case 'maxLength':
                    return this.checkMaxLength(response, rule.value as number);

                case 'validJSON':
                    return this.checkValidJSON(response);

                case 'validCode':
                    return this.checkValidCode(response, rule.language);

                case 'hasCodeBlock':
                    return this.checkHasCodeBlock(response);

                default:
                    logger.warn(`Unknown rule type: ${rule.type}`);
                    return { passed: false, reason: `Unknown rule type: ${rule.type}` };
            }
        } catch (error: any) {
            logger.error(`Error evaluating rule ${rule.type}:`, error);
            return { passed: false, reason: `Rule evaluation error: ${error.message}` };
        }
    }

    private checkContains(
        response: string,
        value: string,
        caseSensitive = false
    ): { passed: boolean; reason: string } {
        const text = caseSensitive ? response : response.toLowerCase();
        const searchValue = caseSensitive ? value : value.toLowerCase();

        const passed = text.includes(searchValue);
        return {
            passed,
            reason: passed ? `Response contains "${value}"` : `Response does not contain "${value}"`,
        };
    }

    private checkRegex(response: string, pattern: string): { passed: boolean; reason: string } {
        try {
            const regex = new RegExp(pattern);
            const passed = regex.test(response);
            return {
                passed,
                reason: passed ? `Response matches pattern /${pattern}/` : `Response does not match pattern /${pattern}/`,
            };
        } catch (error: any) {
            return { passed: false, reason: `Invalid regex pattern: ${error.message}` };
        }
    }

    private checkMinLength(response: string, minLength: number): { passed: boolean; reason: string } {
        const passed = response.length >= minLength;
        return {
            passed,
            reason: passed
                ? `Response length ${response.length} >= ${minLength}`
                : `Response length ${response.length} < ${minLength}`,
        };
    }

    private checkMaxLength(response: string, maxLength: number): { passed: boolean; reason: string } {
        const passed = response.length <= maxLength;
        return {
            passed,
            reason: passed
                ? `Response length ${response.length} <= ${maxLength}`
                : `Response length ${response.length} > ${maxLength}`,
        };
    }

    private checkValidJSON(response: string): { passed: boolean; reason: string } {
        try {
            JSON.parse(response);
            return { passed: true, reason: 'Response is valid JSON' };
        } catch (error) {
            return { passed: false, reason: 'Response is not valid JSON' };
        }
    }

    private checkValidCode(response: string, language?: string): { passed: boolean; reason: string } {
        // Basic code validation - check if it has code blocks or looks like code
        const hasCodeBlock = /```[\s\S]*?```/.test(response);
        const looksLikeCode = /[{}\[\]();]/.test(response) && /\w+\s*[=:]/.test(response);

        const passed = hasCodeBlock || looksLikeCode;

        return {
            passed,
            reason: passed
                ? `Response contains valid code${language ? ` (${language})` : ''}`
                : 'Response does not appear to contain valid code',
        };
    }

    private checkHasCodeBlock(response: string): { passed: boolean; reason: string } {
        const codeBlockRegex = /```[\s\S]*?```/;
        const passed = codeBlockRegex.test(response);

        return {
            passed,
            reason: passed ? 'Response contains code block(s)' : 'Response does not contain code blocks',
        };
    }
}

export default new RuleBasedEvaluator();
