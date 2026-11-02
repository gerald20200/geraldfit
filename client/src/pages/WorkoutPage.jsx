import { ArrowLeft, Check, ChevronDown, Minus, Pause, Plus, RotateCcw, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ExerciseDiagram from '../components/ExerciseDiagram.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api, { getErrorMessage } from '../lib/api.js';

const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function WorkoutPage() {
  const { id } = useParams(); const navigate = useNavigate(); const { refreshUser } = useAuth();
  const [workout, setWorkout] = useState(null); const [error, setError] = useState(''); const [seconds, setSeconds] = useState(0); const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(0); const [sets, setSets] = useState(0); const [intensity, setIntensity] = useState(3); const [notes, setNotes] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { api.get(`/workouts/${id}`).then(({ data }) => { setWorkout(data.workout); setSeconds(data.workout.duration_minutes * 60); }).catch((e) => setError(getErrorMessage(e))); }, [id]);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); setRunning(false); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  async function complete() {
    setSaving(true); setError('');
    try { await api.post('/workouts/complete', { workoutId: id, intensityRating: intensity, notes: notes || `Completed ${sets} sets and ${reps} reps` }); await refreshUser(); navigate('/dashboard', { replace: true }); }
    catch (e) { setError(getErrorMessage(e)); } finally { setSaving(false); }
  }
  if (error && !workout) return <div className="dashboard-page"><Navbar solid /><main className="page-width error-screen"><p className="inline-error">{error}</p><Link className="text-link" to="/dashboard"><ArrowLeft size={16} /> Return to dashboard</Link></main></div>;
  if (!workout) return <div className="screen-loader" aria-label="Loading workout"><span /></div>;
  return <div className="workout-page"><Navbar solid /><main className="player-main page-width"><Link className="back-link player-back" to="/dashboard"><ArrowLeft size={16} /> Training hub</Link>
    <div className="player-heading"><div><p className="eyebrow"><i /> {workout.category.toUpperCase()} / {workout.difficulty.toUpperCase()}</p><h1>{workout.title.toUpperCase()}</h1><p>{workout.description}</p></div><div className="player-duration"><Timer size={17} /> {workout.duration_minutes} MIN SESSION</div></div>
    <div className="player-grid"><section className="player-video-column"><div className="exercise-detail-visual"><ExerciseDiagram type={workout.diagram_type} title={workout.title} /><span className="exercise-visual-category">{workout.category} / {(workout.positions || []).join(' · ')}</span><span className={`exercise-level level-${workout.difficulty.toLowerCase()}`}>{workout.difficulty}</span></div>
      <div className="player-instructions exercise-detail-copy"><p className="eyebrow">INDIVIDUAL EXERCISE / {(workout.positions || []).join(' · ') || 'ALL POSITIONS'}</p><h2>WHAT IT DEVELOPS</h2><p className="exercise-detail-description">{workout.teaches || workout.description}</p><h2>STEP-BY-STEP SESSION</h2><ol className="exercise-detail-steps">{(workout.step_by_step?.length ? workout.step_by_step : [workout.instructions]).map((step) => <li key={step}>{step}</li>)}</ol><h2>BODY POSITION AND TECHNIQUE</h2><p>{workout.body_position || workout.instructions}</p><div className="exercise-detail-repetitions"><span>SESSION TIME / RECOMMENDED REPETITIONS</span><strong>{workout.duration_minutes} min · {workout.recommended_repetitions || 'follow the written steps with full recovery'}</strong></div><div className="exercise-detail-coaching"><section><h3>Common mistakes to avoid</h3><ul>{(workout.common_mistakes || []).map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section><section><h3>Coaching principle</h3><p>{workout.coach_tip || 'Build accuracy and clean technique before increasing speed or volume.'}</p></section><section><h3>Adapt the work safely</h3><p>{workout.age_adaptation || 'Start with lower volume, allow full recovery, and increase only while technique stays clean.'}</p></section></div><details className="equipment-details"><summary>Equipment needed <ChevronDown size={16} /></summary><div className="equipment-list">{(workout.equipment_needed || []).map((item) => <span key={item}>{item}</span>)}</div></details></div></section>
      <aside className="player-controls"><div className="timer-panel"><div className="control-panel-heading"><span>SESSION TIMER</span><button className="icon-button" onClick={() => { setRunning(false); setSeconds(workout.duration_minutes * 60); }} aria-label="Reset timer"><RotateCcw size={16} /></button></div><div className={`timer-display ${seconds === 0 ? 'timer-done' : ''}`}>{clock(seconds)}</div><div className="timer-track"><span style={{ width: `${Math.min(100, seconds / (workout.duration_minutes * 60) * 100)}%` }} /></div><button className="button button-primary timer-toggle" onClick={() => seconds > 0 && setRunning(!running)} disabled={seconds === 0}>{running ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}{running ? 'Pause timer' : seconds === 0 ? 'Timer complete' : 'Start timer'}</button></div>
        <div className="rep-panel"><p className="control-label">TRACK YOUR WORK</p>{[['Reps', reps, setReps], ['Sets', sets, setSets]].map(([label, count, update]) => <div className="stepper" key={label}><div><span>{label}</span><strong>{count}</strong></div><div className="stepper-buttons"><button className="icon-button" onClick={() => update(Math.max(0, count - 1))} aria-label={`Decrease ${label}`}><Minus size={16} /></button><button className="icon-button" onClick={() => update(count + 1)} aria-label={`Increase ${label}`}><Plus size={16} /></button></div></div>)}</div>
        <div className="log-panel"><label htmlFor="session-notes">SESSION NOTES</label><textarea id="session-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did the session feel?" maxLength="500" /><label className="intensity-label">INTENSITY <span>{intensity} / 5</span></label><input className="intensity-range" type="range" min="1" max="5" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} aria-label="Session intensity" /><button className="button button-complete" onClick={complete} disabled={saving}>{saving ? 'Saving session…' : 'Complete session'} <Check size={17} /></button>{error && <p className="form-error" role="alert">{error}</p>}</div>
      </aside></div>
  </main></div>;
}