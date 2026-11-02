import { supabaseAdmin } from '../config/supabase.js';

export async function getAdminOverview() {
  const [players, exercises, completions, recent] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('workouts').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabaseAdmin.from('progress_logs').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('progress_logs')
      .select('id,completed_at,intensity_rating,notes,profiles(full_name,email),workouts(title,category,positions)')
      .order('completed_at', { ascending: false }).limit(8),
  ]);
  for (const result of [players, exercises, completions, recent]) if (result.error) throw result.error;
  return { playerCount: players.count || 0, activeExerciseCount: exercises.count || 0, completionCount: completions.count || 0, recentCompletions: recent.data || [] };
}

export async function listAdminPlayers(search = '') {
  let query = supabaseAdmin.from('profiles')
    .select('id,email,full_name,preferred_position,fitness_level,training_position,training_level,is_admin,created_at')
    .order('created_at', { ascending: false }).limit(100);
  const term = search.trim().replace(/[,%()]/g, '');
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function listAdminWorkouts() {
  const { data, error } = await supabaseAdmin.from('workouts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAdminWorkout(workout) {
  const { data, error } = await supabaseAdmin.from('workouts').insert(workout).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateAdminWorkout(id, workout) {
  const { data, error } = await supabaseAdmin.from('workouts').update(workout).eq('id', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function archiveAdminWorkout(id) {
  const { data, error } = await supabaseAdmin.from('workouts').update({ is_published: false }).eq('id', id).select('id,is_published').maybeSingle();
  if (error) throw error;
  return data;
}