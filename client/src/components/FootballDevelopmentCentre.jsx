import { ArrowRight, ArrowUpRight, Check, CircleCheck, Clock3, Footprints, Goal, LoaderCircle, Medal, Save, Shield, Sparkles, Target, Timer, Trophy, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api.js';
import DevelopmentCentre from './DevelopmentCentre.jsx';
import ExerciseDiagram from './ExerciseDiagram.jsx';
import '../styles/training-center.css';
import '../styles/football-centre.css';
import '../styles/football-academy.css';
import '../styles/level-progression.css';

const positionGroups = [
  { id: 'attackers', name: 'Attackers', Icon: Zap, positions: [{ code: 'ST', name: 'Striker' }, { code: 'CF', name: 'Centre forward' }, { code: 'LW', name: 'Left winger' }, { code: 'RW', name: 'Right winger' }] },
  { id: 'midfielders', name: 'Midfielders', Icon: Footprints, positions: [{ code: 'CDM', name: 'Defensive midfielder' }, { code: 'CM', name: 'Central midfielder' }, { code: 'CAM', name: 'Attacking midfielder' }, { code: 'LM', name: 'Left midfielder' }, { code: 'RM', name: 'Right midfielder' }] },
  { id: 'defenders', name: 'Defenders', Icon: Shield, positions: [{ code: 'CB', name: 'Centre back' }, { code: 'LB', name: 'Left back' }, { code: 'RB', name: 'Right back' }] },
  { id: 'goalkeepers', name: 'Goalkeepers', Icon: Goal, positions: [{ code: 'GK', name: 'Goalkeeper' }] },
];

const allPositions = positionGroups.flatMap((group) => group.positions);
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const fallbackPosition = { Winger: 'LW', Striker: 'ST', Midfielder: 'CM', Defender: 'CB' };
const levelOrder = Object.fromEntries(levels.map((level, index) => [level, index]));
const ageBands = [
  { id: 'under-13', label: 'Under 13', scale: 'Use about half the listed volume, add longer rests, and ask an adult coach to supervise sprinting, heading, or diving.' },
  { id: '13-16', label: '13–16', scale: 'Use around three-quarters of the listed volume; prioritise good technique and full recovery.' },
  { id: '17-plus', label: '17+', scale: 'Use the full written prescription only while technique stays clean; increase work gradually.' },
];

const session = (title, minutes, plan) => ({ title, minutes, plan });
const programmes = {
  ST: { title: 'Striker', identity: 'Penalty-box finisher', focus: 'Arrive on the blindside, attack the near and far zones, and finish with either foot.', targets: ['Finishing accuracy', 'First touch', 'Weak foot'], week: [session('Finish + first touch', 24, 'First-touch gate, then three-zone finishing.'), session('Movement + acceleration', 20, 'Check away, curve into a channel, then four short sprints.'), session('One-on-one composure', 22, 'Approach, set the ball, choose a corner, and finish.' )] },
  CF: { title: 'Centre forward', identity: 'Link-and-finish forward', focus: 'Connect play with your back to goal, spin into space, and arrive balanced to finish.', targets: ['Hold-up play', 'Channel movement', 'Finishing accuracy'], week: [session('Receive + set', 22, 'Shield and escape, then play a one-touch wall set.'), session('Blindside runs', 20, 'Scan, check away, curve into the channel, and receive.'), session('Finish both sides', 24, 'Use one setup touch and finish across the target.' )] },
  LW: { title: 'Left winger', identity: 'Wide creator and threat', focus: 'Receive on the touchline, attack the outside or cut inside, and deliver or finish.', targets: ['1v1 dribbling', 'Cut-in finishing', 'Weak foot'], week: [session('1v1 + acceleration', 22, 'Change pace through gates and accelerate for five metres.'), session('Cut-in + finish', 24, 'Carry inside from the left and target the far corner.'), session('Weak-foot ladder', 18, 'Receive and pass or finish with the weaker foot.' )] },
  RW: { title: 'Right winger', identity: 'Wide creator and threat', focus: 'Threaten both sides, disguise the cut-in, and choose a delivery or far-post finish.', targets: ['1v1 dribbling', 'Cut-in finishing', 'Crossing decision'], week: [session('1v1 + acceleration', 22, 'Change pace through gates and accelerate for five metres.'), session('Cut-in + finish', 24, 'Carry inside from the right and target the far corner.'), session('Weak-foot ladder', 18, 'Receive and pass or finish with the weaker foot.' )] },
  CDM: { title: 'Defensive midfielder', identity: 'Screen and progress', focus: 'Protect the central lane, scan before receiving, and switch play when pressure closes.', targets: ['Defensive awareness', 'Long passing', 'Ball retention'], week: [session('Screen + recover', 22, 'Hold the central lane, then recover to a passing gate.'), session('Scan + switch', 24, 'Check both shoulders and play a diagonal target.'), session('Press escape', 20, 'Receive side-on, turn away from pressure, and retain.' )] },
  CM: { title: 'Central midfielder', identity: 'Tempo setter', focus: 'Scan early, receive on the half-turn, and connect short combinations with switches.', targets: ['Vision and awareness', 'Passing range', 'First touch'], week: [session('Half-turn + pass', 20, 'Receive on the back foot and play through alternating gates.'), session('Passing range', 24, 'Move from short combinations to a diagonal switch.'), session('Turn + retain', 22, 'Escape a pressure cone and find the next passing lane.' )] },
  CAM: { title: 'Attacking midfielder', identity: 'Creative link player', focus: 'Find pockets between lines, scan before receiving, and play forward when the lane opens.', targets: ['Through balls', 'First touch', 'Decision-making'], week: [session('Scan + through ball', 24, 'Check shoulders, receive open, and thread a gate.'), session('Half-turn + escape', 22, 'Receive on the back foot and turn into space.'), session('Final-third choices', 20, 'Choose pass, carry, or shot from a called cue.' )] },
  LM: { title: 'Left midfielder', identity: 'Two-way wide midfielder', focus: 'Support the fullback, receive facing forward, and recover goal-side after an attack.', targets: ['Switching play', 'Ball retention', 'Defensive recovery'], week: [session('Wide receive + switch', 22, 'Receive on the touchline, open up, and switch the gate.'), session('Retain + escape', 20, 'Shield the ball then exit through the free side.'), session('Press + recover', 22, 'Close a lane, turn, and recover to a marker.' )] },
  RM: { title: 'Right midfielder', identity: 'Two-way wide midfielder', focus: 'Balance width with central support, protect the flank, and deliver accurate switches.', targets: ['Passing accuracy', 'Ball retention', 'Defensive awareness'], week: [session('Wide receive + switch', 22, 'Receive on the touchline, open up, and switch the gate.'), session('Retain + escape', 20, 'Shield the ball then exit through the free side.'), session('Press + recover', 22, 'Close a lane, turn, and recover to a marker.' )] },
  CB: { title: 'Centre back', identity: 'Line leader and first passer', focus: 'Protect the space behind, win the right moment, and play through or around pressure.', targets: ['Defensive positioning', 'Aerial timing', 'Passing from the back'], week: [session('Jockey + intercept', 22, 'Hold a goal-side stance and step across the passing lane.'), session('Line shift + aerial timing', 20, 'Call the line movement and practise safe jump/landing.'), session('Build-out passing', 24, 'Open up and hit short and long target gates.' )] },
  LB: { title: 'Left back', identity: 'Flank defender and outlet', focus: 'Defend the channel, recover goal-side, and support progression down the left.', targets: ['1v1 defending', 'Recovery runs', 'Passing from the back'], week: [session('Jockey + contain', 22, 'Guide the attacker wide and step only when the ball is exposed.'), session('Recovery + turn', 20, 'Sprint back, scan the shoulder, and set balanced.'), session('Wide build-out', 24, 'Receive side-on and pass through the left-side gate.' )] },
  RB: { title: 'Right back', identity: 'Flank defender and outlet', focus: 'Protect the right channel, read the winger, and progress play with clean passing.', targets: ['1v1 defending', 'Recovery runs', 'Passing from the back'], week: [session('Jockey + contain', 22, 'Guide the attacker wide and step only when the ball is exposed.'), session('Recovery + turn', 20, 'Sprint back, scan the shoulder, and set balanced.'), session('Wide build-out', 24, 'Receive side-on and pass through the right-side gate.' )] },
  GK: { title: 'Goalkeeper', identity: 'First defender and first passer', focus: 'Set behind the ball, move with short steps, handle securely, and distribute with purpose.', targets: ['Shot stopping', 'Footwork', 'Distribution accuracy'], week: [session('Footwork + set', 20, 'Move to four corners and finish each action in a ready set.'), session('Handling + reaction', 22, 'Catch cleanly, reset, then react to a safe varied rebound.'), session('Claim + distribute', 24, 'Claim a soft high ball and roll or pass through target gates.' )] },
};

function ExerciseCard({ exercise, ageBand, completedCount, completedToday, saving, onComplete }) {
  return <article className="academy-exercise-card">
    <div className="academy-exercise-art"><ExerciseDiagram type={exercise.diagram_type} title={exercise.title} /><span className={`exercise-level level-${exercise.difficulty.toLowerCase()}`}>{exercise.difficulty}</span></div>
    <div className="academy-exercise-content">
      <div className="academy-exercise-kicker"><span>{exercise.category}</span><span>{exercise.duration_minutes} MIN</span></div>
      <h4>{exercise.title}</h4>
      <p className="academy-teaches">{exercise.teaches || exercise.description}</p>
      <div className="academy-work-prescription"><Timer size={15} /><div><small>SESSION / RECOMMENDED WORK</small><strong>{exercise.duration_minutes} min · {exercise.recommended_repetitions}</strong></div></div>
      <p className="academy-age-note"><strong>{ageBand.label}:</strong> {exercise.age_adaptation}</p>
      <div className="academy-card-actions"><Link to={`/workout/${exercise.id}`} className="academy-details-link">Open full lesson <ArrowUpRight size={14} /></Link><button className={`exercise-complete ${completedToday ? 'is-complete' : ''}`} onClick={() => onComplete(exercise)} disabled={saving || completedToday} aria-label={`Log ${exercise.title} complete`} title={`Completed ${completedCount} times`}>{saving ? <LoaderCircle size={15} className="spinning" /> : completedToday ? <CircleCheck size={15} /> : <Check size={15} />}{saving ? 'Saving' : completedToday ? 'Done today' : 'Log complete'}<span className="exercise-completion-count">{completedCount}</span></button></div>
      <details className="academy-lesson-details"><summary>Coaching breakdown <ArrowRight size={13} /></summary>
        <div className="academy-lesson-body"><section><h5>Step by step</h5><ol>{(exercise.step_by_step || []).map((step) => <li key={step}>{step}</li>)}</ol></section><section><h5>Body position and technique</h5><p>{exercise.body_position}</p></section><section><h5>Common mistakes</h5><ul>{(exercise.common_mistakes || []).map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section><section className="academy-coach-tip"><h5>Coach’s principle</h5><p>{exercise.coach_tip}</p></section><section className="academy-skill-tags"><h5>Skills trained</h5><div>{(exercise.skill_tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div></section></div>
      </details>
    </div>
  </article>;
}

export default function FootballDevelopmentCentre({ preferredPosition = 'Midfielder', trainingPosition, trainingLevel = 'Beginner', improvementGoals = [], workoutProgress = {}, recentProgress = [], onProgressSaved }) {
  const [exercises, setExercises] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(trainingPosition || fallbackPosition[preferredPosition] || 'CM');
  const [currentLevel, setCurrentLevel] = useState(trainingLevel || 'Beginner');
  const [selectedLevel, setSelectedLevel] = useState(trainingLevel || 'Beginner');
  const [ageBandId, setAgeBandId] = useState(() => localStorage.getItem('geraldfit_age_band') || '17-plus');
  const [goals, setGoals] = useState(improvementGoals || []);
  const [goalInput, setGoalInput] = useState('');
  const [activeView, setActiveView] = useState('programme');
  const [completedToday, setCompletedToday] = useState(() => new Set());
  const [savingId, setSavingId] = useState('');
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('geraldfit_training_position', selectedPosition);
  }, [selectedPosition]);

  useEffect(() => {
    localStorage.setItem('geraldfit_age_band', ageBandId);
  }, [ageBandId]);

  useEffect(() => {
    if (trainingPosition && allPositions.some((position) => position.code === trainingPosition)) setSelectedPosition(trainingPosition);
  }, [trainingPosition]);

  useEffect(() => {
    if (levels.includes(trainingLevel)) {
      setCurrentLevel(trainingLevel);
      setSelectedLevel(trainingLevel);
    }
  }, [trainingLevel]);

  useEffect(() => {
    setGoals(improvementGoals || []);
  }, [improvementGoals]);

  useEffect(() => {
    api.get('/workouts')
      .then(({ data }) => setExercises(data.workouts.filter((workout) => Array.isArray(workout.positions) && workout.positions.length)))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const position = allPositions.find((item) => item.code === selectedPosition) || allPositions[0];
  const group = positionGroups.find((item) => item.positions.some((itemPosition) => itemPosition.code === selectedPosition));
  const programme = programmes[selectedPosition] || programmes.CM;
  const ageBand = ageBands.find((band) => band.id === ageBandId) || ageBands[2];
  const positionExercises = useMemo(() => exercises.filter((exercise) => exercise.positions.includes(selectedPosition)), [exercises, selectedPosition]);
  const filteredExercises = useMemo(() => positionExercises
    .filter((exercise) => selectedLevel === 'All levels' || exercise.difficulty === selectedLevel)
    .sort((a, b) => levelOrder[a.difficulty] - levelOrder[b.difficulty] || a.title.localeCompare(b.title)), [positionExercises, selectedLevel]);
  const completedCount = positionExercises.reduce((total, exercise) => total + (workoutProgress[exercise.id] || 0), 0);
  const skillProgress = Array.from(new Set(positionExercises.flatMap((exercise) => exercise.skill_tags || []))).map((skill) => ({
    skill,
    count: positionExercises.filter((exercise) => exercise.skill_tags?.includes(skill)).reduce((sum, exercise) => sum + (workoutProgress[exercise.id] || 0), 0),
  })).sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill));
  const currentLevelExercises = positionExercises.filter((exercise) => exercise.difficulty === currentLevel);
  const completedCurrentLevel = currentLevelExercises.filter((exercise) => (workoutProgress[exercise.id] || 0) > 0).length;
  const nextLevel = levels[levelOrder[currentLevel] + 1];
  const requiredLevelCompletions = Math.min(2, currentLevelExercises.length);

  async function savePreferences(nextValues = {}) {
    const preferences = {
      trainingPosition: nextValues.trainingPosition ?? selectedPosition,
      trainingLevel: nextValues.trainingLevel ?? currentLevel,
      improvementGoals: nextValues.improvementGoals ?? goals,
    };
    setSavingPreferences(true);
    setError('');
    setStatus('');
    try {
      await api.patch('/users/training-preferences', preferences);
      setStatus('Saved to your player profile');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingPreferences(false);
    }
  }

  function choosePosition(code) {
    setSelectedPosition(code);
    setCompletedToday(new Set());
    savePreferences({ trainingPosition: code });
  }

  function chooseLevel(level) {
    setSelectedLevel(level);
  }

  function advanceLevel() {
    if (!nextLevel || completedCurrentLevel < requiredLevelCompletions) return;
    setCurrentLevel(nextLevel);
    setSelectedLevel(nextLevel);
    savePreferences({ trainingLevel: nextLevel });
  }

  function addGoal(event) {
    event.preventDefault();
    const goal = goalInput.trim();
    if (!goal || goals.length >= 3 || goals.includes(goal)) return;
    const nextGoals = [...goals, goal];
    setGoals(nextGoals);
    setGoalInput('');
    savePreferences({ improvementGoals: nextGoals });
  }

  function removeGoal(goal) {
    const nextGoals = goals.filter((item) => item !== goal);
    setGoals(nextGoals);
    savePreferences({ improvementGoals: nextGoals });
  }

  async function logExercise(exercise) {
    setSavingId(exercise.id);
    setError('');
    try {
      await api.post('/workouts/complete', { workoutId: exercise.id, intensityRating: 3, notes: `Completed ${exercise.title}: ${exercise.recommended_repetitions}` });
      setCompletedToday((current) => new Set(current).add(exercise.id));
      await onProgressSaved?.();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingId('');
    }
  }

  return <section className="training-centre academy-centre" id="training-centre" aria-labelledby="training-centre-title">
    <header className="academy-centre-header"><div><p className="eyebrow"><i /> PLAYER DEVELOPMENT / {group?.name.toUpperCase()}</p><h2 id="training-centre-title">YOUR FOOTBALL <span>ACADEMY</span></h2><p>Learn the detail. Train with purpose. Track the work that moves your game forward.</p></div><div className="academy-player-badge"><span><Medal size={18} /></span><div><small>PLAYER PROFILE</small><strong>{position.code} <em>{programme.identity}</em></strong></div></div></header>

    <div className="position-groups" aria-label="Choose your playing position">{positionGroups.map((positionGroup) => <div className={`position-group ${positionGroup.id === group?.id ? 'position-group-active' : ''}`} key={positionGroup.id}><div className="position-group-heading"><positionGroup.Icon size={15} /><span>{positionGroup.name}</span></div><div className="position-options">{positionGroup.positions.map((item) => <button key={item.code} className={`position-option ${selectedPosition === item.code ? 'position-option-active' : ''}`} onClick={() => choosePosition(item.code)} aria-pressed={selectedPosition === item.code} title={item.name}>{item.code}</button>)}</div></div>)}</div>

    <div className="academy-profile-strip"><div><span className="academy-profile-label">CURRENT LEVEL</span><strong>{currentLevel}</strong></div><div><span className="academy-profile-label">POSITION PROGRAMME</span><strong>{programme.title}</strong></div><div><span className="academy-profile-label">EXERCISE COMPLETIONS</span><strong>{completedCount}</strong></div><label className="age-selector"><span className="academy-profile-label">AGE BAND</span><select value={ageBandId} onChange={(event) => setAgeBandId(event.target.value)} aria-label="Choose age band">{ageBands.map((band) => <option key={band.id} value={band.id}>{band.label}</option>)}</select></label></div>

    <nav className="academy-view-tabs" aria-label="Training centre sections">{[{ id: 'programme', label: 'Position programme', Icon: Target }, { id: 'development', label: 'Development centre', Icon: Sparkles }, { id: 'progress', label: 'My progress', Icon: Trophy }].map(({ id, label, Icon }) => <button key={id} className={activeView === id ? 'academy-view-active' : ''} onClick={() => setActiveView(id)} aria-pressed={activeView === id}><Icon size={16} /><span>{label}</span></button>)}</nav>

    {error && <div className="training-error" role="alert">{error}</div>}
    {status && <p className="academy-save-status" role="status"><CircleCheck size={14} />{status}</p>}

    {activeView === 'programme' && <>
      <section className="position-programme-card"><div className="position-programme-copy"><span className="academy-section-eyebrow">YOUR SPECIALIST PROGRAMME</span><h3>{programme.title}: <span>{programme.identity}</span></h3><p>{programme.focus}</p><div className="position-targets">{programme.targets.map((target) => <span key={target}><Check size={12} />{target}</span>)}</div></div><div className="weekly-plan-grid">{programme.week.map((work, index) => <article className="weekly-plan-item" key={work.title}><span>SESSION 0{index + 1} <b>{work.minutes} MIN</b></span><strong>{work.title}</strong><p>{work.plan}</p></article>)}</div></section>
      <div className="level-progression"><div><span className="academy-section-eyebrow">LEVEL-UP PATH / CURRENT: {currentLevel.toUpperCase()}</span><p>{nextLevel ? `Log ${requiredLevelCompletions} different ${currentLevel.toLowerCase()} exercises to unlock ${nextLevel.toLowerCase()}.` : 'Advanced programme reached. Keep refining technique and consistency.'}</p><div className="level-progression-track"><span style={{ width: `${nextLevel ? Math.min(100, completedCurrentLevel / Math.max(1, requiredLevelCompletions) * 100) : 100}%` }} /></div></div><button onClick={advanceLevel} disabled={!nextLevel || completedCurrentLevel < requiredLevelCompletions || savingPreferences}>{savingPreferences ? <LoaderCircle size={14} className="spinning" /> : <ArrowRight size={14} />}{nextLevel ? `Advance to ${nextLevel}` : 'Top level reached'}</button></div>
      <div className="academy-exercise-toolbar"><div><span className="academy-section-eyebrow">ROLE-SPECIFIC PRACTICE</span><h3>{position.name} training <span>·</span> {filteredExercises.length} exercises</h3></div><div className="academy-filters"><label><span>LEVEL</span><select value={selectedLevel} onChange={(event) => chooseLevel(event.target.value)}><option>All levels</option>{levels.map((level) => <option key={level}>{level}</option>)}</select></label><div className="academy-level-progress">{levels.map((level, index) => <span key={level} className={levelOrder[selectedLevel === 'All levels' ? trainingLevel : selectedLevel] >= index ? 'academy-level-lit' : ''} title={level} />)}</div></div></div>
      <p className="age-guidance"><Sparkles size={14} /> <span><strong>{ageBand.label} training guidance:</strong> {ageBand.scale}</span></p>
      {loading ? <div className="training-loading"><LoaderCircle size={20} className="spinning" /> Loading your programme…</div> : filteredExercises.length ? <div className="academy-exercise-grid">{filteredExercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} ageBand={ageBand} completedCount={workoutProgress[exercise.id] || 0} completedToday={completedToday.has(exercise.id)} saving={savingId === exercise.id} onComplete={logExercise} />)}</div> : <div className="training-empty"><Target size={23} /><div><strong>No exercises in this filter yet.</strong><span>Choose another level or apply the football development migration in Supabase.</span></div></div>}
      <div className="academy-programme-footer"><span><CircleCheck size={14} />Progress saves to your account</span><span>Increase volume only when technique remains consistent.</span></div>
    </>}

    {activeView === 'development' && <DevelopmentCentre />}

    {activeView === 'progress' && <section className="academy-progress-view"><div className="academy-progress-heading"><div><span className="academy-section-eyebrow">YOUR DEVELOPMENT DASHBOARD</span><h3>Small steps. <span>Visible progress.</span></h3><p>Your specialist position, current level, training history, and personal targets are saved to your player profile.</p></div><div className="academy-progress-level"><Medal size={18} /><span>{currentLevel}</span></div></div>
      <div className="academy-progress-columns"><section className="academy-progress-panel"><div className="academy-panel-heading"><h4><Target size={15} />Skills in development</h4><span>{skillProgress.length} SKILLS</span></div>{skillProgress.length ? <div className="skill-progress-list">{skillProgress.map(({ skill, count }) => { const maxCount = Math.max(...skillProgress.map((item) => item.count), 1); return <div className="skill-progress-row" key={skill}><div><span>{skill}</span><strong>{count} sessions</strong></div><div className="skill-progress-track"><span style={{ width: `${Math.min(100, count / maxCount * 100)}%` }} /></div></div>; })}</div> : <p className="academy-muted-copy">Complete an exercise to start seeing skill progress.</p>}</section>
        <section className="academy-progress-panel"><div className="academy-panel-heading"><h4><Clock3 size={15} />Recent training</h4><span>LAST 5</span></div>{recentProgress.length ? <div className="training-history-list">{recentProgress.map((item) => <article key={item.id}><span className="history-mark"><Check size={13} /></span><div><strong>{item.workouts?.title || 'Training exercise'}</strong><small>{new Date(item.completed_at).toLocaleDateString()} · Effort {item.intensity_rating}/5</small></div></article>)}</div> : <p className="academy-muted-copy">Your completed sessions will appear here.</p>}</section></div>
      <section className="academy-goals-panel"><div><span className="academy-section-eyebrow">PERSONAL IMPROVEMENT GOALS</span><h4>Choose up to three focus points.</h4><p>Keep goals specific enough to practise and review week by week.</p></div><div className="academy-goal-list">{goals.map((goal) => <button key={goal} onClick={() => removeGoal(goal)} title="Remove goal">{goal}<span>×</span></button>)}</div><form className="academy-goal-form" onSubmit={addGoal}><input value={goalInput} onChange={(event) => setGoalInput(event.target.value)} placeholder={goals.length >= 3 ? 'Remove a goal to add another' : 'e.g. improve my weaker-foot passing'} maxLength="120" disabled={goals.length >= 3} aria-label="New improvement goal"/><button type="submit" disabled={goals.length >= 3 || !goalInput.trim() || savingPreferences}>{savingPreferences ? <LoaderCircle size={15} className="spinning" /> : <Save size={15} />} Save goal</button></form></section>
      <div className="academy-progress-footer"><span><Check size={14} />{savingPreferences ? 'Saving profile…' : 'Position, level, and goals are account-specific'}</span><span>{selectedPosition} / {currentLevel}</span></div>
    </section>}
  </section>;
}