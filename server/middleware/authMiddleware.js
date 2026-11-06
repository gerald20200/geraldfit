import { supabaseAuth } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Sign in to continue.' });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  req.user = { id: data.user.id, email: data.user.email };
  return next();
}