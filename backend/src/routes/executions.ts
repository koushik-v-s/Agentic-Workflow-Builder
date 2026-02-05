import { Router } from 'express';
import ExecutionController from '../controllers/ExecutionController';

const router = Router();

router.post('/', ExecutionController.startExecution);
router.get('/:id', ExecutionController.getExecutionStatus);
router.post('/:id/cancel', ExecutionController.cancelExecution);
router.get('/:id/logs', ExecutionController.getExecutionLogs);

export default router;
