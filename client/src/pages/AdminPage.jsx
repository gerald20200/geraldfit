import { Activity, Archive, ArrowLeft, ArrowUpRight, BookOpen, Check, ChevronRight, CirclePlus, Clock3, Dumbbell, Edit3, LoaderCircle, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import api, { getErrorMessage } from '../lib/api.js';
import '../styles/admin-dashboard.css';
import '../styles/admin-dashboard.css';

const tabs = [{ id: 'overview', label: 'Overview', Icon: Activity }, { id: 'exercises', label: 'Exercise library', Icon: Dumbbell }, { id: 'players', label: 'Players', Icon: Users }];
const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
const diagramTypes = ['passing', 'switching', 'through_ball', 'wall_receive', 'shooting', 'cut_in', 'dribbling', 'movement', 'defending', 'interception', 'aerial', 'goalkeeping', 'keeper_set', 'goalkeeper_catch', 'keeper_reaction', 'distribution', 'conditioning'];
const initialForm = {
  title: '', category: 'Agility', durationMinutes: 12, difficulty: 'Beginner', description: '', instructions: '', positions: ['CM'],
  recommendedRepetitions: '', teaches: '', stepByStep: '', bodyPosition: '', commonMistakes: '', coachTip: '',
  ageAdaptation: '', skillTags: '', diagramType: 'movement', equipmentNeeded: '',
};

function lines(value) { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
function asForm(exercise) {
  return {
    title: exercise.title, category: exercise.category, durationMinutes: exercise.duration_minutes, difficulty: exercise.difficulty,
    description: exercise.description || '', instructions: exercise.instructions || '', positions: exercise.positions || [],
    recommendedRepetitions: exercise.recommended_repetitions || '', teaches: exercise.teaches || '',
    stepByStep: (exercise.step_by_step || []).join('\n'), bodyPosition: exercise.body_position || '',
    commonMistakes: (exercise.common_mistakes || []).join('\n'), coachTip: exercise.coach_tip || '',
    ageAdaptation: exercise.age_adaptation || '', skillTags: (exercise.skill_tags || []).join('\n'),
    diagramType: exercise.diagram_type || 'movement', equipmentNeeded: (exercise.equipment_needed || []).join('\n'),
  };
}

function toPayload(form) {
  return {
    ...form,
    durationMinutes: Number(form.durationMinutes),
    stepByStep: lines(form.stepByStep),
    commonMistakes: lines(form.commonMistakes),
    skillTags: lines(form.skillTags),
    equipmentNeeded: lines(form.equipmentNeeded),
  };
}

function AdminMetric({ label, value, note, Icon, tone }) {
  return <article className={`admin-metric admin-metric-${tone}`}><span className="admin-metric-icon"><Icon size={18} /></span><span className="admin-metric-label">{label}</span><strong>{value ?? '—'}</strong><small>{note}</small></article>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResponse, exercisesResponse, playersResponse] = await Promise.all([
        api.get('/admin/overview'), api.get('/admin/exercises'), api.get('/admin/players'),
      ]);
      setOverview(overviewResponse.data.overview);
      setExercises(exercisesResponse.data.exercises);
      setPlayers(playersResponse.data.players);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function searchPlayers(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/players', { params: { search: playerSearch } });
      setPlayers(data.players);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }

  function startCreate() {
    setEditingId('');
    setForm({ ...initialForm });
    setFormOpen(true);
    setActiveTab('exercises');
    setError('');
    setNotice('');
  }

  function startEdit(exercise) {
    setEditingId(exercise.id);
    setForm(asForm(exercise));
    setFormOpen(true);
    setActiveTab('exercises');
    setError('');
    setNotice('');
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function togglePosition(position) {
    setForm((current) => ({ ...current, positions: current.positions.includes(position) ? current.positions.filter((item) => item !== position) : [...current.positions, position] }));
  }

  async function saveExercise(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = toPayload(form);
      if (editingId) await api.put(`/admin/exercises/${editingId}`, payload);
      else await api.post('/admin/exercises', payload);
      setNotice(editingId ? 'Exercise updated.' : 'Exercise added to the library.');
      setFormOpen(false);
      setEditingId('');
      await loadDashboard();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  }

  async function archiveExercise(exercise) {
    if (!window.confirm(`Archive “${exercise.title}”? It will disappear from player programmes, but past completion history will remain.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/admin/exercises/${exercise.id}`);
      setNotice('Exercise archived. Player history is preserved.');
      await loadDashboard();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }

  const publishedExercises = exercises.filter((exercise) => exercise.is_published);
  return <div className="admin-page"><Navbar solid /><main className="admin-main page-width">
    <div className="admin-topline"><a className="back-link" href="/dashboard"><ArrowLeft size={15} /> Player training</a><span><ShieldCheck size={14} /> ADMIN CONSOLE</span></div>
    <header className="admin-page-heading"><div><p className="eyebrow"><i /> GERALDFIT / OPERATIONS</p><h1>ACADEMY <span>CONTROL</span></h1><p>Manage player development, exercise content, and training activity.</p></div><button className="button button-primary" onClick={startCreate}><CirclePlus size={17} /> Add exercise</button></header>
    <nav className="admin-tabs" aria-label="Admin dashboard sections">{tabs.map(({ id, label, Icon }) => <button key={id} onClick={() => { setActiveTab(id); setFormOpen(false); }} className={activeTab === id ? 'admin-tab-active' : ''}><Icon size={15} />{label}</button>)}</nav>
    {error && <div className="admin-message admin-message-error" role="alert">{error}</div>}{notice && <div className="admin-message admin-message-success" role="status"><Check size={15} />{notice}</div>}
    {loading ? <div className="admin-loading"><LoaderCircle size={19} className="spinning" /> Loading academy data…</div> : <>
      {activeTab === 'overview' && <section className="admin-overview"><div className="admin-metric-grid"><AdminMetric label="Registered players" value={overview?.playerCount} note="Supabase player profiles" Icon={Users} tone="green" /><AdminMetric label="Published exercises" value={overview?.activeExerciseCount} note={`${exercises.length - publishedExercises.length} archived`} Icon={BookOpen} tone="blue" /><AdminMetric label="Completed sessions" value={overview?.completionCount} note="All player progress logs" Icon={Activity} tone="gold" /></div>
        <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-section-label">PLAYER ACTIVITY</span><h2>Recent completions</h2></div><button className="admin-quiet-button" onClick={() => setActiveTab('players')}>Open players <ArrowUpRight size={14} /></button></div>{overview?.recentCompletions?.length ? <div className="admin-activity-list">{overview.recentCompletions.map((item) => { const player = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles; const workout = Array.isArray(item.workouts) ? item.workouts[0] : item.workouts; return <article key={item.id}><span className="admin-activity-mark"><Check size={14} /></span><div className="admin-activity-player"><strong>{player?.full_name || 'Player'}</strong><small>{player?.email || 'Account'}</small></div><div className="admin-activity-exercise"><strong>{workout?.title || 'Exercise'}</strong><small>{workout?.category || 'Training'} · Effort {item.intensity_rating}/5</small></div><time>{new Date(item.completed_at).toLocaleDateString()}</time><ChevronRight size={15} /></article>; })}</div> : <div className="admin-empty">No training completions recorded yet.</div>}</section>
      </section>}

      {activeTab === 'players' && <section className="admin-panel admin-player-panel"><div className="admin-panel-heading"><div><span className="admin-section-label">PLAYER DIRECTORY</span><h2>Registered players <small>{players.length} shown</small></h2></div><form className="admin-search" onSubmit={searchPlayers}><Search size={15} /><input value={playerSearch} onChange={(event) => setPlayerSearch(event.target.value)} placeholder="Search name or email" aria-label="Search players" /><button type="submit">Search</button></form></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Player</th><th>Position</th><th>Training level</th><th>Joined</th><th>Access</th></tr></thead><tbody>{players.map((player) => <tr key={player.id}><td><strong>{player.full_name}</strong><small>{player.email}</small></td><td>{player.training_position || player.preferred_position}</td><td>{player.training_level || player.fitness_level}</td><td>{new Date(player.created_at).toLocaleDateString()}</td><td><span className={`admin-role-badge ${player.is_admin ? 'admin-role-admin' : ''}`}>{player.is_admin ? 'Admin' : 'Player'}</span></td></tr>)}</tbody></table>{players.length === 0 && <div className="admin-empty">No players match this search.</div>}</div><p className="admin-table-note">Admin access is assigned in Supabase; it cannot be granted from this dashboard.</p></section>}

      {activeTab === 'exercises' && <section className="admin-exercise-section">{formOpen && <form className="admin-panel admin-exercise-form" onSubmit={saveExercise}>
        <div className="admin-panel-heading"><div><span className="admin-section-label">{editingId ? 'EDIT EXERCISE' : 'NEW EXERCISE'}</span><h2>{editingId ? 'Update coaching content' : 'Build an exercise lesson'}</h2></div><button type="button" className="admin-icon-button" onClick={() => setFormOpen(false)} aria-label="Close exercise editor"><X size={17} /></button></div>
        <div className="admin-form-grid"><label>Exercise name<input name="title" value={form.title} onChange={updateField} required minLength="3" maxLength="100" /></label><label>Category<select name="category" value={form.category} onChange={updateField}>{['Agility','Dribbling','Passing','Stamina'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Difficulty<select name="difficulty" value={form.difficulty} onChange={updateField}>{['Beginner','Intermediate','Advanced'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Minutes<input name="durationMinutes" type="number" min="1" max="90" value={form.durationMinutes} onChange={updateField} required /></label><label>Instruction diagram<select name="diagramType" value={form.diagramType} onChange={updateField}>{diagramTypes.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select></label><label className="admin-field-wide">Recommended repetitions / timing<input name="recommendedRepetitions" value={form.recommendedRepetitions} onChange={updateField} required maxLength="300" placeholder="4 sets x 6 reps; rest 30 seconds" /></label>
          <fieldset className="admin-field-wide"><legend>Positions</legend><div className="admin-position-checks">{positions.map((position) => <label key={position}><input type="checkbox" checked={form.positions.includes(position)} onChange={() => togglePosition(position)} />{position}</label>)}</div></fieldset>
          <label className="admin-field-wide">Short description<textarea name="description" value={form.description} onChange={updateField} required maxLength="500" rows="2" /></label><label className="admin-field-wide">What it teaches<textarea name="teaches" value={form.teaches} onChange={updateField} required maxLength="1000" rows="2" /></label><label className="admin-field-wide">Step-by-step instructions <small>One step per line</small><textarea name="stepByStep" value={form.stepByStep} onChange={updateField} required rows="4" /></label><label className="admin-field-wide">Body position and technique<textarea name="bodyPosition" value={form.bodyPosition} onChange={updateField} required rows="3" /></label><label className="admin-field-wide">Common mistakes <small>One mistake per line</small><textarea name="commonMistakes" value={form.commonMistakes} onChange={updateField} required rows="3" /></label><label className="admin-field-wide">Coach tip<textarea name="coachTip" value={form.coachTip} onChange={updateField} required rows="2" /></label><label className="admin-field-wide">Age adaptation and safety<textarea name="ageAdaptation" value={form.ageAdaptation} onChange={updateField} required rows="3" /></label><label className="admin-field-wide">Skills developed <small>One tag per line</small><textarea name="skillTags" value={form.skillTags} onChange={updateField} required rows="2" /></label><label className="admin-field-wide">Equipment needed <small>One item per line</small><textarea name="equipmentNeeded" value={form.equipmentNeeded} onChange={updateField} rows="2" /></label><label className="admin-field-wide">Full instructions for player app<textarea name="instructions" value={form.instructions} onChange={updateField} required rows="3" /></label></div>
        <div className="admin-form-actions"><span>Exercise diagrams are generated from the selected movement type; no videos are used.</span><button className="button button-primary" type="submit" disabled={saving}>{saving ? <LoaderCircle size={16} className="spinning" /> : <Check size={16} />}{editingId ? 'Save changes' : 'Publish exercise'}</button></div>
      </form>}
        <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-section-label">COACHING LIBRARY</span><h2>Exercises <small>{publishedExercises.length} published</small></h2></div><button className="button button-primary" onClick={startCreate}><CirclePlus size={16} /> Add exercise</button></div><div className="admin-exercise-list">{exercises.map((exercise) => <article key={exercise.id} className={!exercise.is_published ? 'admin-exercise-archived' : ''}><span className="admin-exercise-diagram"><Dumbbell size={17} /></span><div className="admin-exercise-name"><strong>{exercise.title}</strong><small>{exercise.category} · {exercise.difficulty} · {exercise.positions?.join(', ') || 'Unassigned'}</small></div><span className={`admin-published-badge ${exercise.is_published ? 'is-published' : ''}`}>{exercise.is_published ? 'Published' : 'Archived'}</span>{exercise.is_published && <><button className="admin-icon-button" onClick={() => startEdit(exercise)} aria-label={`Edit ${exercise.title}`} title="Edit exercise"><Edit3 size={15} /></button><button className="admin-icon-button admin-icon-danger" onClick={() => archiveExercise(exercise)} aria-label={`Archive ${exercise.title}`} title="Archive exercise"><Archive size={15} /></button></>}</article>)}</div></section>
      </section>}
    </>}
  </main></div>;
}