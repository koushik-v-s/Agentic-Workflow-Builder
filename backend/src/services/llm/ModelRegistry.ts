import prisma from '../../config/database';
import logger from '../../config/logger';

export interface ModelInfo {
    id: string;
    provider: string;
    displayName: string;
    costPer1kInput: number;
    costPer1kOutput: number;
    contextWindow: number;
    isAvailable: boolean;
    capabilities?: any;
}

class ModelRegistry {
    private cache: Map<string, ModelInfo> = new Map();
    private lastFetch = 0;
    private CACHE_TTL = 60000; // 1 minute

    async getModel(modelId: string): Promise<ModelInfo | null> {
        await this.refreshCacheIfNeeded();

        const model = this.cache.get(modelId);
        if (!model) {
            logger.warn(`Model not found: ${modelId}`);
            return null;
        }

        return model;
    }

    async getAllModels(): Promise<ModelInfo[]> {
        await this.refreshCacheIfNeeded();
        return Array.from(this.cache.values()).filter((m) => m.isAvailable);
    }

    async calculateCost(modelId: string, promptTokens: number, completionTokens: number): Promise<number> {
        const model = await this.getModel(modelId);
        if (!model) {
            logger.warn(`Cannot calculate cost for unknown model: ${modelId}`);
            return 0;
        }

        const inputCost = (promptTokens / 1000) * model.costPer1kInput;
        const outputCost = (completionTokens / 1000) * model.costPer1kOutput;

        return inputCost + outputCost;
    }

    async getCheapestModel(): Promise<ModelInfo | null> {
        const models = await this.getAllModels();
        if (models.length === 0) return null;

        // Sort by average cost (input + output) / 2
        models.sort((a, b) => {
            const avgCostA = (a.costPer1kInput + a.costPer1kOutput) / 2;
            const avgCostB = (b.costPer1kInput + b.costPer1kOutput) / 2;
            return avgCostA - avgCostB;
        });

        return models[0];
    }

    private async refreshCacheIfNeeded(): Promise<void> {
        const now = Date.now();
        if (now - this.lastFetch < this.CACHE_TTL) {
            return;
        }

        try {
            const models = await prisma.model.findMany({
                where: { isAvailable: true },
            });

            this.cache.clear();
            models.forEach((model) => {
                this.cache.set(model.id, {
                    id: model.id,
                    provider: model.provider,
                    displayName: model.displayName,
                    costPer1kInput: parseFloat(model.costPer1kInput.toString()),
                    costPer1kOutput: parseFloat(model.costPer1kOutput.toString()),
                    contextWindow: model.contextWindow,
                    isAvailable: model.isAvailable,
                    capabilities: model.capabilities || {},
                });
            });

            this.lastFetch = now;
            logger.debug(`Model registry refreshed with ${models.length} models`);
        } catch (error) {
            logger.error('Failed to refresh model registry:', error);
        }
    }
}

export default new ModelRegistry();
