import { addProgress } from '../models/progressModel.js';
import { findWorkout, listWorkouts } from '../models/workoutModel.js';

const categories = ['Agility', 'Dribbling', 'Passing', 'Stamina'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getWorkouts(req, res, next) {
  try {
    const category = categories.includes(req.query.category) ? req.query.category : undefined;
    return res.json({ workouts: await listWorkouts(category) });
  } catch (error) { return next(error); }
}

export async function getWorkout(req, res, next) {
  try {
    if (!uuidPattern.test(req.params.id)) return res.status(404).json({ message: 'Workout not found.' });
    const workout = await findWorkout(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });
    return res.json({ workout });
  } catch (error) { return next(error); }
}

export async function completeWorkout(req, res, next) {
  try {
    const { workoutId, intensityRating = 3, notes = '' } = req.body;
    if (typeof workoutId !== 'string' || !uuidPattern.test(workoutId)) return res.status(400).json({ message: 'A valid workout is required.' });
    if (!Number.isInteger(intensityRating) || intensityRating < 1 || intensityRating > 5) return res.status(400).json({ message: 'Intensity must be from 1 to 5.' });
    if (typeof notes !== 'string' || notes.length > 500) return res.status(400).json({ message: 'Notes must be 500 characters or fewer.' });
    if (!await findWorkout(workoutId)) return res.status(404).json({ message: 'Workout not found.' });
    const progress = await addProgress({ userId: req.user.id, workoutId, intensityRating, notes: notes.trim() });
    return res.status(201).json({ progress });
  } catch (error) { return next(error); }
}