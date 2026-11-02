import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const projectUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');

export const supabaseAuth = createClient(projectUrl, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const supabaseAdmin = createClient(projectUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});