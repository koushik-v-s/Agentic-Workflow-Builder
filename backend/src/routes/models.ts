import { Router } from 'express';
import ModelController from '../controllers/ModelController';

const router = Router();

router.get('/', ModelController.getAllModels);
router.get('/:id', ModelController.getModelById);

export default router;
