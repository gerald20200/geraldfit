import { supabaseAdmin } from '../config/supabase.js';

function missingPublishColumn(error) {
  return error.code === '42703' || error.code === 'PGRST204' || /is_published/i.test(error.message || '');
}

export async function listWorkouts(category) {
  let query = supabaseAdmin.from('workouts').select('*').eq('is_published', true).order('category').order('title');
  if (category) query = query.eq('category', category);
  let { data, error } = await query;
  if (error && missingPublishColumn(error)) {
    query = supabaseAdmin.from('workouts').select('*').order('category').order('title');
    if (category) query = query.eq('category', category);
    ({ data, error } = await query);
  }
  if (error) throw error;
  return data;
}

export async function findWorkout(id) {
  let { data, error } = await supabaseAdmin.from('workouts').select('*').eq('id', id).eq('is_published', true).maybeSingle();
  if (error && missingPublishColumn(error)) {
    ({ data, error } = await supabaseAdmin.from('workouts').select('*').eq('id', id).maybeSingle());
  }
  if (error) throw error;
  return data;
}