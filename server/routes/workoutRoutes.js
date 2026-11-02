import { Router } from 'express';
import { completeWorkout, getWorkout, getWorkouts } from '../controllers/workoutController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getWorkouts);
router.post('/complete', requireAuth, completeWorkout);
router.get('/:id', getWorkout);
export default router;