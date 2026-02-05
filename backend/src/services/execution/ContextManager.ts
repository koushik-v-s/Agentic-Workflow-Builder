import logger from '../../config/logger';

export class ContextManager {
    /**
     * Extract context from a previous step's output based on the context mode
     */
    extractContext(
        output: string,
        mode: string,
        selector?: string
    ): string {
        try {
            switch (mode) {
                case 'full':
                    return output;

                case 'selective':
                    return this.extractSelective(output, selector);

                case 'summary':
                    return this.createSummary(output);

                case 'custom':
                    return this.applyCustomExtraction(output, selector);

                default:
                    logger.warn(`Unknown context mode: ${mode}, using full`);
                    return output;
            }
        } catch (error: any) {
            logger.error('Error extracting context:', error);
            return output; // Fallback to full output
        }
    }

    /**
     * Inject context into a prompt template
     */
    injectContext(
        template: string,
        currentContext: string,
        allOutputs: Array<{ stepOrder: number; output: string }> = []
    ): string {
        let prompt = template;

        // Replace {{previous_output}}
        prompt = prompt.replace(/\{\{previous_output\}\}/g, currentContext);

        // Replace {{step_N_output}}
        allOutputs.forEach((item) => {
            const placeholder = new RegExp(`\\{\\{step_${item.stepOrder}_output\\}\\}`, 'g');
            prompt = prompt.replace(placeholder, item.output);
        });

        // Replace {{all_outputs}}
        const allOutputsText = allOutputs
            .map((item) => `=== Step ${item.stepOrder} ===\n${item.output}`)
            .join('\n\n');
        prompt = prompt.replace(/\{\{all_outputs\}\}/g, allOutputsText);

        return prompt;
    }

    /**
     * Extract selective content (code blocks, JSON, etc.)
     */
    private extractSelective(output: string, selector?: string): string {
        if (!selector) {
            // Default: extract code blocks
            return this.extractCodeBlocks(output);
        }

        // Check if selector is a type indicator
        if (selector === 'code' || selector === 'codeblocks') {
            return this.extractCodeBlocks(output);
        }

        if (selector === 'json') {
            return this.extractJSON(output);
        }

        // Try as regex
        try {
            const regex = new RegExp(selector, 'gs');
            const matches = output.match(regex);
            return matches ? matches.join('\n') : output;
        } catch (error) {
            logger.warn(`Invalid selector regex: ${selector}`);
            return output;
        }
    }

    /**
     * Extract code blocks from markdown
     */
    private extractCodeBlocks(text: string): string {
        const codeBlockRegex = /```[\s\S]*?```/g;
        const matches = text.match(codeBlockRegex);

        if (!matches || matches.length === 0) {
            logger.debug('No code blocks found in output');
            return text;
        }

        return matches.join('\n\n');
    }

    /**
     * Extract JSON from text
     */
    private extractJSON(text: string): string {
        // Try to find JSON objects or arrays
        const jsonRegex = /\{[\s\S]*?\}|\[[\s\S]*?\]/g;
        const matches = text.match(jsonRegex);

        if (!matches) {
            return text;
        }

        // Validate and return first valid JSON
        for (const match of matches) {
            try {
                JSON.parse(match);
                return match;
            } catch (e) {
                continue;
            }
        }

        return text;
    }

    /**
     * Create a summary of the output (simple truncation for now)
     */
    private createSummary(output: string, maxLength: number = 500): string {
        if (output.length <= maxLength) {
            return output;
        }

        // Take first and last portions
        const halfLength = Math.floor(maxLength / 2);
        const start = output.substring(0, halfLength);
        const end = output.substring(output.length - halfLength);

        return `${start}\n\n[... truncated ...]\n\n${end}`;
    }

    /**
     * Apply custom extraction logic
     */
    private applyCustomExtraction(output: string, selector?: string): string {
        // For now, same as selective
        // In future, could support JSONPath, XPath, etc.
        return this.extractSelective(output, selector);
    }

    /**
     * Check if context fits within token limit (rough estimation)
     */
    estimateTokens(text: string): number {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    /**
     * Truncate context if it exceeds token limit
     */
    truncateToTokenLimit(text: string, maxTokens: number): string {
        const estimatedTokens = this.estimateTokens(text);

        if (estimatedTokens <= maxTokens) {
            return text;
        }

        logger.warn(`Context too large (${estimatedTokens} tokens), truncating to ${maxTokens}`);

        // Keep roughly maxTokens worth of text
        const maxChars = maxTokens * 4;
        return this.createSummary(text, maxChars);
    }
}

export default new ContextManager();
