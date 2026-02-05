import { Request, Response, NextFunction } from 'express';
import WorkflowService from '../services/workflow/WorkflowService';
import StepService from '../services/workflow/StepService';
import { CreateWorkflowSchema, UpdateWorkflowSchema, CreateStepSchema, UpdateStepSchema } from '../types/workflow.types';
import logger from '../config/logger';

export class WorkflowController {
    async getAllWorkflows(req: Request, res: Response, next: NextFunction) {
        try {
            const workflows = await WorkflowService.getAllWorkflows();
            res.json({ success: true, data: workflows });
        } catch (error) {
            next(error);
        }
    }

    async getWorkflowById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const workflow = await WorkflowService.getWorkflowById(id);

            if (!workflow) {
                return res.status(404).json({ success: false, error: 'Workflow not found' });
            }

            res.json({ success: true, data: workflow });
        } catch (error) {
            next(error);
        }
    }

    async createWorkflow(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateWorkflowSchema.parse(req.body);
            const workflow = await WorkflowService.createWorkflow(data);
            res.status(201).json({ success: true, data: workflow });
        } catch (error) {
            next(error);
        }
    }

    async updateWorkflow(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = UpdateWorkflowSchema.parse(req.body);
            const workflow = await WorkflowService.updateWorkflow(id, data);
            res.json({ success: true, data: workflow });
        } catch (error) {
            next(error);
        }
    }

    async deleteWorkflow(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await WorkflowService.deleteWorkflow(id);
            res.json({ success: true, message: 'Workflow deleted' });
        } catch (error) {
            next(error);
        }
    }

    async duplicateWorkflow(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const workflow = await WorkflowService.duplicateWorkflow(id);
            res.status(201).json({ success: true, data: workflow });
        } catch (error) {
            next(error);
        }
    }

    async createStep(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = CreateStepSchema.parse(req.body);
            const step = await StepService.createStep(id, data);
            res.status(201).json({ success: true, data: step });
        } catch (error) {
            next(error);
        }
    }

    async updateStep(req: Request, res: Response, next: NextFunction) {
        try {
            const { stepId } = req.params;
            const data = UpdateStepSchema.parse(req.body);
            const step = await StepService.updateStep(stepId, data);
            res.json({ success: true, data: step });
        } catch (error) {
            next(error);
        }
    }

    async deleteStep(req: Request, res: Response, next: NextFunction) {
        try {
            const { stepId } = req.params;
            await StepService.deleteStep(stepId);
            res.json({ success: true, message: 'Step deleted' });
        } catch (error) {
            next(error);
        }
    }

    async reorderSteps(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { stepOrders } = req.body;
            const steps = await StepService.reorderSteps(id, stepOrders);
            res.json({ success: true, data: steps });
        } catch (error) {
            next(error);
        }
    }
}

export default new WorkflowController();
