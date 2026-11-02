import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/api.js';
import '../styles/auth.css';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (mode === 'signup') {
        const result = await register(payload);
        if (!result) { setConfirmationEmail(payload.email); return; }
      } else await login({ email: payload.email, password: payload.password });
      navigate('/dashboard', { replace: true });
    }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }

  return <main className="auth-layout"><section className="auth-visual"><Link className="brand" to="/"><span className="brand-mark">G</span><span>GERALD<span className="brand-light">FIT</span></span></Link><div className="auth-visual-copy"><p className="eyebrow"><i /> YOUR GAME DOESN'T STAND STILL</p><h1>THE NEXT<br />VERSION OF<br /><span>YOU IS BUILT.</span></h1><p>One session at a time. Wherever you are.</p></div><span className="auth-visual-index">TRAINING LOG / 001</span></section>
    <section className="auth-panel"><Link className="back-link" to="/"><ArrowLeft size={16} /> Back to home</Link><div className="auth-form-wrap"><p className="eyebrow"><i /> PLAYER ACCESS</p><h2>{mode === 'login' ? 'Welcome back.' : 'Let’s get to work.'}</h2><p className="auth-subtitle">{mode === 'login' ? 'Pick up where your last session left off.' : 'Set up your profile and find your first session.'}</p>
      <div className="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button></div>
      {confirmationEmail ? <div className="confirmation-message" role="status"><ShieldCheck size={24} /><h3>Check your inbox.</h3><p>We sent a confirmation link to <strong>{confirmationEmail}</strong>. Verify your address, then sign in to start training.</p><button className="text-link" type="button" onClick={() => { setConfirmationEmail(''); setMode('login'); }}>Back to sign in <ArrowRight size={16} /></button></div> : <form className="auth-form" onSubmit={submit}>
        {mode === 'signup' && <><label>Full name<input name="fullName" autoComplete="name" placeholder="Alex Morgan" required minLength="2" maxLength="80" /></label><div className="form-row"><label>Position<select name="preferredPosition" defaultValue="Midfielder"><option>Winger</option><option>Striker</option><option>Midfielder</option><option>Defender</option></select></label><label>Fitness level<select name="fitnessLevel" defaultValue="Beginner"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div></>}
        <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength="254" /></label><label>Password<div className="password-field"><input name="password" type={visible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" required minLength="8" maxLength="128" /><button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create my account'} <ArrowRight size={17} /></button>
      </form>}<p className="auth-security"><ShieldCheck size={15} /> Your account details are protected by Supabase Auth.</p>
    </div></section></main>;
}