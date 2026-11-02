import { supabaseAdmin } from '../config/supabase.js';

export async function addProgress({ userId, workoutId, intensityRating, notes }) {
  const { data, error } = await supabaseAdmin.from('progress_logs')
    .insert({ user_id: userId, workout_id: workoutId, intensity_rating: intensityRating, notes })
    .select('id,user_id,workout_id,completed_at,intensity_rating,notes').single();
  if (error) throw error;
  return data;
}

export async function getProgressSummary(userId, since) {
  const [allLogs, recentLogs, weekLogs, totalLogs] = await Promise.all([
    supabaseAdmin.from('progress_logs').select('completed_at,workout_id').eq('user_id', userId).order('completed_at', { ascending: false }).limit(500),
    supabaseAdmin.from('progress_logs').select('id,workout_id,completed_at,intensity_rating,notes,workouts(title,category,duration_minutes)').eq('user_id', userId).order('completed_at', { ascending: false }).limit(5),
    supabaseAdmin.from('progress_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('completed_at', since.toISOString()),
    supabaseAdmin.from('progress_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  for (const result of [allLogs, recentLogs, weekLogs, totalLogs]) if (result.error) throw result.error;
  return { allLogs: allLogs.data, recentLogs: recentLogs.data, weeklyCompletions: weekLogs.count || 0, totalCompletions: totalLogs.count || 0 };
}