import { Router } from 'express';
import workflowRoutes from './workflows';
import executionRoutes from './executions';
import modelRoutes from './models';
import historyRoutes from './history';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'agentic-workflow-backend',
    });
});

// API routes
router.use('/workflows', workflowRoutes);
router.use('/executions', executionRoutes);
router.use('/models', modelRoutes);
router.use('/history', historyRoutes);

export default router;
