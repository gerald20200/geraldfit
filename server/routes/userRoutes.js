import { Router } from 'express';
import { getProfile, saveTrainingPreferences } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/profile', requireAuth, getProfile);
router.patch('/training-preferences', requireAuth, saveTrainingPreferences);
export default router;