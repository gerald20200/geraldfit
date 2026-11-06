import { getProgressSummary } from '../models/progressModel.js';
import { findProfile, findTrainingPreferences, updateTrainingPreferences } from '../models/userModel.js';

const trainingPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
const trainingLevels = ['Beginner', 'Intermediate', 'Advanced'];

function missingTrainingMigration(error) {
  return error.code === '42703' || error.code === 'PGRST204' || /training_position|training_level|improvement_goals/i.test(error.message || '');
}

function dateKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export async function getProfile(req, res, next) {
  try {
    const profile = await findProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: 'Player profile not found.' });
    let preferences = null;
    try { preferences = await findTrainingPreferences(req.user.id); }
    catch (error) { if (!missingTrainingMigration(error)) throw error; }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const { allLogs, recentLogs, weeklyCompletions, totalCompletions } = await getProgressSummary(req.user.id, weekStart);
    const activeDays = new Set(allLogs.map((entry) => dateKey(entry.completed_at)));
    const workoutProgress = allLogs.reduce((counts, entry) => {
      counts[entry.workout_id] = (counts[entry.workout_id] || 0) + 1;
      return counts;
    }, {});
    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return activeDays.has(dateKey(date));
    });
    let streakDays = 0;
    const cursor = new Date(today);
    if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(dateKey(cursor))) { streakDays += 1; cursor.setDate(cursor.getDate() - 1); }
    return res.json({ user: {
      id: profile.id, email: profile.email, fullName: profile.full_name,
      preferredPosition: profile.preferred_position, fitnessLevel: profile.fitness_level,
      trainingPosition: preferences?.training_position || ({ Winger: 'LW', Striker: 'ST', Defender: 'CB', Midfielder: 'CM' }[profile.preferred_position] || 'CM'),
      trainingLevel: preferences?.training_level || profile.fitness_level || 'Beginner',
      improvementGoals: preferences?.improvement_goals || [],
      createdAt: profile.created_at, totalCompletions,
      weeklyCompletions, streakDays, weeklyActivity, recentProgress: recentLogs,
      workoutProgress,
    } });
  } catch (error) { return next(error); }
}

export async function saveTrainingPreferences(req, res, next) {
  try {
    const { trainingPosition, trainingLevel, improvementGoals } = req.body;
    if (!trainingPositions.includes(trainingPosition)) return res.status(400).json({ message: 'Choose a valid playing position.' });
    if (!trainingLevels.includes(trainingLevel)) return res.status(400).json({ message: 'Choose a valid training level.' });
    if (!Array.isArray(improvementGoals) || improvementGoals.length > 3 || improvementGoals.some((goal) => typeof goal !== 'string' || !goal.trim() || goal.length > 120)) {
      return res.status(400).json({ message: 'Choose up to three goals, each no longer than 120 characters.' });
    }
    try {
      const preferences = await updateTrainingPreferences(req.user.id, {
        trainingPosition,
        trainingLevel,
        improvementGoals: improvementGoals.map((goal) => goal.trim()),
      });
      return res.json({ preferences: {
        trainingPosition: preferences.training_position,
        trainingLevel: preferences.training_level,
        improvementGoals: preferences.improvement_goals,
      } });
    } catch (error) {
      if (missingTrainingMigration(error)) return res.status(409).json({ message: 'Run the football development migration in Supabase before saving training preferences.' });
      throw error;
    }
  } catch (error) { return next(error); }
}