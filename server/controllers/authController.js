import { supabaseAdmin, supabaseAuth } from '../config/supabase.js';
import { findProfile, upsertProfile } from '../models/userModel.js';

const positions = ['Winger', 'Striker', 'Midfielder', 'Defender'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

function clientUser(profile) {
  return { id: profile.id, email: profile.email, fullName: profile.full_name, preferredPosition: profile.preferred_position, fitnessLevel: profile.fitness_level, createdAt: profile.created_at };
}

function validCredentials(email, password) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
    && typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, preferredPosition = 'Midfielder', fitnessLevel = 'Beginner' } = req.body;
    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 80) return res.status(400).json({ message: 'Enter a name between 2 and 80 characters.' });
    if (!validCredentials(email, password)) return res.status(400).json({ message: 'Enter a valid email and a password between 8 and 128 characters.' });
    if (!positions.includes(preferredPosition) || !levels.includes(fitnessLevel)) return res.status(400).json({ message: 'Choose a valid position and fitness level.' });

    const normalizedEmail = email.trim().toLowerCase();
    const { data: created, error: createError } = await supabaseAuth.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName.trim(), preferred_position: preferredPosition, fitness_level: fitnessLevel } },
    });
    if (createError) return res.status(400).json({ message: createError.message });
    if (!created.user || created.user.identities?.length === 0) return res.status(409).json({ message: 'An account with this email already exists.' });
    const profile = await upsertProfile({ id: created.user.id, email: normalizedEmail, full_name: fullName.trim(), preferred_position: preferredPosition, fitness_level: fitnessLevel });
    if (!created.session) return res.status(201).json({ requiresEmailConfirmation: true, email: normalizedEmail });
    return res.status(201).json({ token: created.session.access_token, refreshToken: created.session.refresh_token, user: clientUser(profile) });
  } catch (error) { return next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!validCredentials(email, password)) return res.status(400).json({ message: 'Enter a valid email and password.' });
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.session) return res.status(401).json({ message: 'Email or password is incorrect.' });
    let profile = await findProfile(data.user.id);
    if (!profile) profile = await upsertProfile({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata.full_name || 'Player',
      preferred_position: data.user.user_metadata.preferred_position || 'Midfielder',
      fitness_level: data.user.user_metadata.fitness_level || 'Beginner',
    });
    return res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token, user: clientUser(profile) });
  } catch (error) { return next(error); }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== 'string' || !refreshToken) return res.status(400).json({ message: 'A refresh token is required.' });
    const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    const profile = await findProfile(data.user.id);
    if (!profile) return res.status(401).json({ message: 'Player profile not found. Please sign in again.' });
    return res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token, user: clientUser(profile) });
  } catch (error) { return next(error); }
}