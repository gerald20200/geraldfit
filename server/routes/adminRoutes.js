import { Router } from 'express';
import { archiveExercise, createExercise, editExercise, getExercises, getOverview, getPlayers } from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/overview', getOverview);
router.get('/players', getPlayers);
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);
router.put('/exercises/:id', editExercise);
router.delete('/exercises/:id', archiveExercise);
export default router;