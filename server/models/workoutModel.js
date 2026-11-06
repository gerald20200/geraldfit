import { supabaseAdmin } from '../config/supabase.js';

export async function listWorkouts(category) {
  let query = supabaseAdmin.from('workouts').select('*').order('category').order('title');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function findWorkout(id) {
  const { data, error } = await supabaseAdmin.from('workouts').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}