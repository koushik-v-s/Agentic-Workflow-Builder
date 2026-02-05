import { Router } from 'express';
import ExecutionController from '../controllers/ExecutionController';

const router = Router();

router.get('/workflows/:workflowId', ExecutionController.getExecutionHistory);

export default router;
