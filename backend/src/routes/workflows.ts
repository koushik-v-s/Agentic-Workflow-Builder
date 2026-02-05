import { Router } from 'express';
import WorkflowController from '../controllers/WorkflowController';

const router = Router();

// Workflow CRUD
router.get('/', WorkflowController.getAllWorkflows);
router.get('/:id', WorkflowController.getWorkflowById);
router.post('/', WorkflowController.createWorkflow);
router.put('/:id', WorkflowController.updateWorkflow);
router.delete('/:id', WorkflowController.deleteWorkflow);
router.post('/:id/duplicate', WorkflowController.duplicateWorkflow);

// Step management
router.post('/:id/steps', WorkflowController.createStep);
router.put('/:id/steps/:stepId', WorkflowController.updateStep);
router.delete('/:id/steps/:stepId', WorkflowController.deleteStep);
router.put('/:id/steps/reorder', WorkflowController.reorderSteps);

export default router;
