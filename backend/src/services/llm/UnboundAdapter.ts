import axios, { AxiosInstance } from 'axios';
import { UNBOUND_CONFIG } from '../../config/constants';
import logger from '../../config/logger';

export interface LLMRequest {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
}

export interface LLMResponse {
    text: string;
    tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
    };
    model: string;
    metadata?: any;
}

class UnboundAdapter {
    private client: AxiosInstance;

    constructor() {
        if (!UNBOUND_CONFIG.API_KEY) {
            logger.warn('⚠️ UNBOUND_API_KEY not set. LLM calls will fail.');
        }

        // Extract base URL (remove /v1/chat/completions if present)
        const baseURL = UNBOUND_CONFIG.API_URL.replace(/\/v1\/chat\/completions$/, '');

        this.client = axios.create({
            baseURL: baseURL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${UNBOUND_CONFIG.API_KEY}`,
            },
            timeout: 60000, // 60 seconds
        });
    }

    async call(request: LLMRequest): Promise<LLMResponse> {
        try {
            logger.info(`Calling Unbound API with model: ${request.model}`);

            // Adapt to Unbound API format
            const response = await this.client.post('/v1/chat/completions', {
                model: request.model,
                messages: [
                    {
                        role: 'user',
                        content: request.prompt,
                    },
                ],
                temperature: request.temperature || 0.7,
                max_tokens: request.maxTokens || 2000,
            });

            const data = response.data;

            // Extract response
            const text = data.choices[0].message.content;
            const tokensUsed = {
                prompt: data.usage?.prompt_tokens || 0,
                completion: data.usage?.completion_tokens || 0,
                total: data.usage?.total_tokens || 0,
            };

            logger.info(`Unbound API response received. Tokens used: ${tokensUsed.total}`);

            return {
                text,
                tokensUsed,
                model: request.model,
                metadata: {
                    finishReason: data.choices[0].finish_reason,
                    id: data.id,
                },
            };
        } catch (error: any) {
            logger.error('Unbound API error:', error.response?.data || error.message);

            // Handle specific error types
            if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            if (error.response?.status === 401) {
                throw new Error('Invalid API key. Check your UNBOUND_API_KEY.');
            }
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. The LLM took too long to respond.');
            }

            throw new Error(`LLM call failed: ${error.message}`);
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.call({
                model: 'gpt-3.5-turbo',
                prompt: 'Say "OK"',
                maxTokens: 10,
            });
            return response.text.length > 0;
        } catch (error) {
            logger.error('Unbound API connection test failed:', error);
            return false;
        }
    }
}

export default new UnboundAdapter();
