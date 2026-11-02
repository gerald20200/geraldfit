import {
  archiveAdminWorkout,
  createAdminWorkout,
  getAdminOverview,
  listAdminPlayers,
  listAdminWorkouts,
  updateAdminWorkout,
} from '../models/adminModel.js';

const categories = ['Agility', 'Dribbling', 'Passing', 'Stamina'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
const diagrams = ['passing', 'switching', 'through_ball', 'wall_receive', 'shooting', 'cut_in', 'dribbling', 'movement', 'defending', 'interception', 'aerial', 'goalkeeping', 'keeper_set', 'goalkeeper_catch', 'keeper_reaction', 'distribution', 'conditioning'];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseWorkout(body) {
  const { title, category, durationMinutes, difficulty, description, instructions, positions: targetPositions,
    recommendedRepetitions, teaches, stepByStep, bodyPosition, commonMistakes, coachTip, ageAdaptation,
    skillTags, diagramType, equipmentNeeded = [] } = body;
  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) return { error: 'Exercise title must be between 3 and 100 characters.' };
  if (!categories.includes(category)) return { error: 'Choose a valid exercise category.' };
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 90) return { error: 'Duration must be between 1 and 90 minutes.' };
  if (!difficulties.includes(difficulty)) return { error: 'Choose a valid difficulty level.' };
  if (!Array.isArray(targetPositions) || !targetPositions.length || targetPositions.some((position) => !positions.includes(position))) return { error: 'Select at least one valid playing position.' };
  const strings = [description, instructions, recommendedRepetitions, teaches, bodyPosition, coachTip, ageAdaptation];
  if (strings.some((value) => typeof value !== 'string' || !value.trim() || value.length > 2000)) return { error: 'Complete each lesson field and keep it under 2,000 characters.' };
  if (!diagrams.includes(diagramType)) return { error: 'Choose an instructional diagram type.' };
  if (![stepByStep, commonMistakes, skillTags, equipmentNeeded].every(Array.isArray)) return { error: 'Steps, mistakes, skills, and equipment must be lists.' };
  if (!stepByStep.length || stepByStep.length > 8 || stepByStep.some((item) => typeof item !== 'string' || !item.trim() || item.length > 300)) return { error: 'Add 1 to 8 clear exercise steps.' };
  if (!commonMistakes.length || commonMistakes.length > 6 || commonMistakes.some((item) => typeof item !== 'string' || !item.trim() || item.length > 300)) return { error: 'Add 1 to 6 common mistakes.' };
  if (!skillTags.length || skillTags.length > 8 || skillTags.some((item) => typeof item !== 'string' || !item.trim() || item.length > 60)) return { error: 'Add 1 to 8 skill tags.' };
  if (equipmentNeeded.length > 8 || equipmentNeeded.some((item) => typeof item !== 'string' || !item.trim() || item.length > 60)) return { error: 'Equipment list must contain at most 8 short items.' };
  return { workout: {
    title: title.trim(), category, duration_minutes: durationMinutes, difficulty,
    description: description.trim(), instructions: instructions.trim(), positions: [...new Set(targetPositions)],
    recommended_repetitions: recommendedRepetitions.trim(), teaches: teaches.trim(),
    step_by_step: stepByStep.map((item) => item.trim()), body_position: bodyPosition.trim(),
    common_mistakes: commonMistakes.map((item) => item.trim()), coach_tip: coachTip.trim(),
    age_adaptation: ageAdaptation.trim(), skill_tags: [...new Set(skillTags.map((item) => item.trim()))],
    diagram_type: diagramType, equipment_needed: [...new Set(equipmentNeeded.map((item) => item.trim()))],
  } };
}

function migrationRequired(error) {
  return error.code === '42703' || error.code === 'PGRST204' || /is_published|is_admin|step_by_step|diagram_type/i.test(error.message || '');
}

function handleAdminError(error, res, next) {
  if (migrationRequired(error)) return res.status(409).json({ message: 'Apply the admin dashboard and football development migrations in Supabase first.' });
  return next(error);
}

export async function getOverview(req, res, next) {
  try { return res.json({ overview: await getAdminOverview() }); }
  catch (error) { return handleAdminError(error, res, next); }
}

export async function getPlayers(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 80) : '';
    return res.json({ players: await listAdminPlayers(search) });
  } catch (error) { return handleAdminError(error, res, next); }
}

export async function getExercises(req, res, next) {
  try { return res.json({ exercises: await listAdminWorkouts() }); }
  catch (error) { return handleAdminError(error, res, next); }
}

export async function createExercise(req, res, next) {
  const parsed = parseWorkout(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  try { return res.status(201).json({ exercise: await createAdminWorkout({ ...parsed.workout, is_published: true }) }); }
  catch (error) { return handleAdminError(error, res, next); }
}

export async function editExercise(req, res, next) {
  if (!uuidPattern.test(req.params.id)) return res.status(404).json({ message: 'Exercise not found.' });
  const parsed = parseWorkout(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  try {
    const exercise = await updateAdminWorkout(req.params.id, parsed.workout);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    return res.json({ exercise });
  } catch (error) { return handleAdminError(error, res, next); }
}

export async function archiveExercise(req, res, next) {
  if (!uuidPattern.test(req.params.id)) return res.status(404).json({ message: 'Exercise not found.' });
  try {
    const exercise = await archiveAdminWorkout(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found.' });
    return res.json({ exercise, message: 'Exercise archived; player history is preserved.' });
  } catch (error) { return handleAdminError(error, res, next); }
}