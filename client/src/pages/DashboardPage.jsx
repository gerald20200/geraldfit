import { ArrowRight, CalendarDays, Flame, Footprints, Medal, MoveUpRight, Sparkles, Target, TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import FootballDevelopmentCentre from '../components/FootballDevelopmentCentre.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/users/profile').then(({ data }) => setProfile(data.user)).catch((e) => setError(getErrorMessage(e)));
  }, []);
  const activity = profile?.weeklyActivity || [];
  const today = (new Date().getDay() + 6) % 7;
  return <div className="dashboard-page"><Navbar solid /><main className="dashboard-main page-width">
    <div className="dashboard-greeting"><div><p className="eyebrow"><i /> TRAINING HUB / PLAYER 001</p><h1>GOOD TO SEE YOU, <span>{(user?.fullName || 'PLAYER').split(' ')[0].toUpperCase()}.</span></h1><p className="dashboard-subtitle">{user?.preferredPosition || 'Footballer'} · {user?.fitnessLevel || 'Building your baseline'} · Keep the work moving.</p></div><a className="button button-primary greeting-action" href="#training-centre"><Footprints size={17} /> Start a session <MoveUpRight size={16} /></a></div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    <section className="dashboard-stats" aria-label="Training statistics"><article className="stat-panel stat-highlight"><div className="stat-icon"><Flame size={20} /></div><p>ACTIVE STREAK</p><div className="stat-value">{profile?.streakDays || 0}<span> days</span></div><span className="stat-note">{profile?.streakDays ? 'Keep the rhythm going' : 'Your first session starts it'}</span><div className="streak-mark">✳</div></article>
      <article className="stat-panel"><div className="stat-icon muted-icon"><CalendarDays size={19} /></div><p>THIS WEEK</p><div className="stat-value">{profile?.weeklyCompletions || 0}<span> sessions</span></div><div className="week-dots">{days.map((day, i) => <div className="week-day" key={`${day}-${i}`}><span className={`week-dot ${activity[i] ? 'complete' : i === today ? 'today' : ''}`}>{activity[i] ? '✓' : ''}</span><small>{day}</small></div>)}</div></article>
      <article className="stat-panel"><div className="stat-icon muted-icon"><TimerReset size={19} /></div><p>ALL-TIME SESSIONS</p><div className="stat-value">{profile?.totalCompletions || 0}<span> completed</span></div><span className="stat-note">Every rep adds up.</span><div className="stat-watermark"><Target size={52} /></div></article></section>
    <section className="recommendation-row"><div className="section-label"><span className="section-icon"><Sparkles size={16} /></span><div><p className="eyebrow">TODAY'S FOCUS</p><h2>Make your next touch count.</h2></div></div><span className="recommendation-badge"><Medal size={15} /> {user?.preferredPosition || 'ALL POSITIONS'}</span></section>
    <FootballDevelopmentCentre preferredPosition={user?.preferredPosition} trainingPosition={profile?.trainingPosition} trainingLevel={profile?.trainingLevel} improvementGoals={profile?.improvementGoals} workoutProgress={profile?.workoutProgress} recentProgress={profile?.recentProgress || []} onProgressSaved={async () => { const { data } = await api.get('/users/profile'); setProfile(data.user); }} />
    <section className="dashboard-bottom"><div><span className="bottom-index">01 / THE PROCESS</span><h2>CONSISTENCY<br />BEATS INTENSITY.</h2></div><p>One focused session today is better than a perfect plan for someday. Get started, build your streak, and let the progress take care of itself.</p><a className="bottom-arrow" href="#training-centre" aria-label="Start training"><ArrowRight size={20} /></a></section>
  </main></div>;
}