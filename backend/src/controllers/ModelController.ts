import { Request, Response, NextFunction } from 'express';
import ModelRegistry from '../services/llm/ModelRegistry';

export class ModelController {
    async getAllModels(req: Request, res: Response, next: NextFunction) {
        try {
            const models = await ModelRegistry.getAllModels();
            res.json({ success: true, data: models });
        } catch (error) {
            next(error);
        }
    }

    async getModelById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const model = await ModelRegistry.getModel(id);

            if (!model) {
                return res.status(404).json({ success: false, error: 'Model not found' });
            }

            res.json({ success: true, data: model });
        } catch (error) {
            next(error);
        }
    }
}

export default new ModelController();
