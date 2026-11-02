import { supabaseAdmin } from '../config/supabase.js';

export async function upsertProfile(profile) {
  const { data, error } = await supabaseAdmin.from('profiles').upsert(profile, { onConflict: 'id' })
    .select('id,email,full_name,preferred_position,fitness_level,created_at').single();
  if (error) throw error;
  return data;
}

export async function findProfile(userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select('id,email,full_name,preferred_position,fitness_level,created_at').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findTrainingPreferences(userId) {
  const { data, error } = await supabaseAdmin.from('profiles')
    .select('training_position,training_level,improvement_goals')
    .eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateTrainingPreferences(userId, preferences) {
  const { data, error } = await supabaseAdmin.from('profiles').update({
    training_position: preferences.trainingPosition,
    training_level: preferences.trainingLevel,
    improvement_goals: preferences.improvementGoals,
  }).eq('id', userId).select('training_position,training_level,improvement_goals').single();
  if (error) throw error;
  return data;
}

export async function findAdminStatus(userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data?.is_admin);
}