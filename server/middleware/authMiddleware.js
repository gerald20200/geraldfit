import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Sign in to continue.' });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  req.user = { id: data.user.id, email: data.user.email };
  return next();
}

export async function requireAdmin(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('profiles')
      .select('is_admin').eq('id', req.user.id).maybeSingle();
    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204' || /is_admin/i.test(error.message || '')) {
        return res.status(503).json({ message: 'Apply the admin dashboard migration before opening admin tools.' });
      }
      return next(error);
    }
    if (!data?.is_admin) return res.status(403).json({ message: 'Admin access is required.' });
    return next();
  } catch (error) { return next(error); }
}