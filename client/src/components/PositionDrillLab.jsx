import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flame, Pause, Play, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react';
import ExerciseDiagram from './ExerciseDiagram.jsx';
import '../styles/position-drill-lab.css';
import '../styles/position-drill-reference.css';

const rewardKey = 'geraldfit_position_drill_rewards';
const durationSeconds = 45;
const positionNames = {
  GK: 'Goalkeeper', CB: 'Central defender', LB: 'Left fullback', RB: 'Right fullback',
  CDM: 'Defensive central midfielder', CM: 'Central midfielder', CAM: 'Attacking central midfielder',
  LM: 'Left wide midfielder', RM: 'Right wide midfielder', LW: 'Left winger', RW: 'Right winger',
  ST: 'Striker', CF: 'Central forward',
};

const drills = {
  goalkeeper: {
    title: 'Wall-Reaction Catch & Low Dive', diagram: 'home_gk',
    focus: 'Handling, reactions and low footwork', space: '3 × 3 yards',
    steps: [
      'Stand three yards from a sturdy wall. Get balanced, with soft hands ready.',
      'Underarm-toss a soft ball and catch its bounce in front of your body.',
      'Shuffle three yards, set your feet, then practise a controlled low save on a padded mat.',
    ],
    coach: 'Brilliant keepers get set before the shot. Make every catch quiet and secure, then find your balance again.',
    tip: 'Keep your hands in front of your knees and move your feet before reaching.',
    safety: 'Use a soft ball, a clear non-slip space and an adult nearby. Practise low, controlled movement only; never dive into furniture or attempt full-height home dives.',
  },
  defender: {
    title: 'Aerial Header Jump & Drop-Step Sprint', diagram: 'home_cb',
    focus: 'Backpedalling, drop-step and landing', space: '5-yard lane',
    steps: [
      'Place two cones five yards apart on a clear, level surface.',
      'Backpedal to the second cone, then drop-step at 45 degrees and accelerate.',
      'Jump toward an imaginary high ball, then land softly and hold your balance.',
    ],
    coach: 'Read the flight early, move your feet, and arrive balanced. Great defending starts with timing, not force.',
    tip: 'Land with knees soft and pointing the same way as your toes.',
    safety: 'For solo home practice, use an imaginary ball and do not head a thrown or hard ball. Keep the floor clear; ask a qualified coach about age-appropriate heading practice.',
  },
  fullback: {
    title: 'Touchline Overlap & Recovery Sprint', diagram: 'home_fullback',
    focus: 'Overlapping run, crossing shape and recovery', space: '15-yard lane outdoors',
    steps: [
      'Mark a touchline and two cones. Shorten the lane if you are training at home.',
      'Run past both cones with the ball close, then shape a driven cross toward a target.',
      'Turn and run forward at an easy pace back to your starting cone.',
    ],
    coach: 'Overlap with your head up. After the cross, recover quickly but stay in control of your feet.',
    tip: 'Turn to run forward for recovery instead of sprinting backwards.',
    safety: 'Only use the full 15-yard sprint in an open field. Indoors, shorten the lane, remove loose objects and use a controlled jog for recovery.',
  },
  holding_midfielder: {
    title: '4-Cone Shielding & Pivot Pass', diagram: 'home_cdm',
    focus: 'Defensive shuffle, pivot and passing', space: '5 × 5-yard box',
    steps: [
      'Set four cones in a five-yard square; make it smaller if space is limited.',
      'Shuffle side to side in a low stance without crossing your feet.',
      'Call “turn”, pivot and scan, then pass firmly to a safe wall target.',
    ],
    coach: 'You are the screen in front of the defence. Stay patient, scan early, then move sharply when the lane opens.',
    tip: 'Keep your body between the imaginary opponent and the ball.',
    safety: 'Use a clear, non-slip area and a safe wall target. Reduce the square to a few steps per side when training indoors.',
  },
  central_midfielder: {
    title: 'T-Drill Touch & 360 Scan', diagram: 'home_cm',
    focus: 'Acceleration, lateral movement and scanning', space: '10 yards forward, 5 yards wide',
    steps: [
      'Build a T with cones: ten yards forward and five yards to each side.',
      'Move forward, shuffle left and right, then return under control.',
      'Scan both shoulders before a wall pass; open up and receive on your back foot.',
    ],
    coach: 'The best midfielders scan before the ball arrives. Check both shoulders, open up, and make your next touch count.',
    tip: 'Look away from the ball, then find it again just before your first touch.',
    safety: 'Use the full distances only outdoors on a clear surface. Shorten every leg indoors and keep the ball away from windows.',
  },
  attacking_midfielder: {
    title: 'Half-Turn Cut & Rapid Finish', diagram: 'home_cam',
    focus: 'Scanning, half-turn and quick finishing', space: 'Outside a safe target area',
    steps: [
      'Set a cone as a defender and choose a clear receiving point.',
      'Scan, then receive across your body on your back foot and turn past the cone.',
      'Accelerate into space and take a controlled shot at your target.',
    ],
    coach: 'Scan before you receive. A clever first touch can take you past pressure before the defender reacts.',
    tip: 'Show one way with your shoulders, then take your first touch the other way.',
    safety: 'Use a soft ball indoors and a clear target. Save powerful shooting for a suitable outdoor space with an adult’s permission.',
  },
  wide_midfielder: {
    title: 'Sideline One-Two & Driven Cross', diagram: 'home_widemid',
    focus: 'One-two pass, movement and low crossing', space: 'Short touchline lane',
    steps: [
      'Set a stable rebounder beside a touchline and mark a short lane.',
      'Pass into the rebounder, move wide and meet the return.',
      'Carry the ball forward, then play a low cross to your target.',
    ],
    coach: 'A wide midfielder helps in both directions. Make the pass, move early, and deliver with your head up.',
    tip: 'Aim for a target on the ground before you add pace to the cross.',
    safety: 'Use a stable rebounder or a safe wall with plenty of space. Keep crosses low indoors and avoid nearby people or breakable items.',
  },
  winger: {
    title: 'Cut-Inside Curl & Endline Take-On', diagram: 'home_winger',
    focus: 'Dribbling, change of direction and curling finish', space: 'Cone-to-target lane',
    steps: [
      'Set a cone as a defender and choose a safe far-post target.',
      'Dribble toward the cone, then use an inside chop or step-over.',
      'Push into space, accelerate past the cone and curl a controlled shot.',
    ],
    coach: 'Sell the move with your body, then change speed. The skill is creating space for your next action.',
    tip: 'Keep the ball close enough for your next touch and look up before the finish.',
    safety: 'Choose a soft ball and a ground-level target indoors. Practise faster dribbling and shooting only where you have a clear, safe run-out.',
  },
  forward: {
    title: 'Hold-Up Shield, Spin & Quick Shot', diagram: 'home_forward',
    focus: 'Hold-up strength and instant finishing', space: '3 × 3 yards',
    steps: [
      'Place a cone behind you to represent a defender and mark a safe target.',
      'Receive with your back to the cone, bend your knees and shield the ball.',
      'Spin left or right into space and take a quick, controlled shot.',
    ],
    coach: 'Strong forwards protect the ball with their shape, then turn when they see space. Stay calm and choose your moment.',
    tip: 'Use your arm for balance, not to push; turn into the space you scanned first.',
    safety: 'There is no contact in this solo drill. Use a soft ball indoors and leave enough clear space for the turn and follow-through.',
  },
};

const positionDrills = {
  GK: 'goalkeeper', CB: 'defender', LB: 'fullback', RB: 'fullback', CDM: 'holding_midfielder',
  CM: 'central_midfielder', CAM: 'attacking_midfielder', LM: 'wide_midfielder', RM: 'wide_midfielder',
  LW: 'winger', RW: 'winger', ST: 'forward', CF: 'forward',
};

const demoStageNames = {
  goalkeeper: ['Ready stance', 'Catch return', 'Shuffle + save'],
  defender: ['Set cones', 'Drop-step', 'Jump + land'],
  fullback: ['Mark lane', 'Overlap + cross', 'Recover'],
  holding_midfielder: ['Set square', 'Shuffle', 'Pivot + pass'],
  central_midfielder: ['Set T', 'Move through T', 'Scan + receive'],
  attacking_midfielder: ['Set defender', 'Scan + turn', 'Finish'],
  wide_midfielder: ['Set rebounder', 'Play one-two', 'Drive cross'],
  winger: ['Set cone', 'Cut inside', 'Curl to target'],
  forward: ['Set defender', 'Shield + spin', 'Quick shot'],
};

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function loadRewards() {
  try {
    const saved = JSON.parse(localStorage.getItem(rewardKey) || '{}');
    return {
      totalXp: Number.isFinite(saved.totalXp) ? saved.totalXp : 0,
      date: saved.date === todayKey() ? saved.date : todayKey(),
      todayXp: saved.date === todayKey() && Number.isFinite(saved.todayXp) ? saved.todayXp : 0,
      completed: saved.date === todayKey() && Array.isArray(saved.completed) ? saved.completed : [],
    };
  } catch {
    return { totalXp: 0, date: todayKey(), todayXp: 0, completed: [] };
  }
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function PositionDrillLab({ positionCode, ageBand, streakDays = 0, trackingExercise, loading, saving, onComplete }) {
  const drillKey = positionDrills[positionCode] || 'central_midfielder';
  const drill = drills[drillKey];
  const stageNames = demoStageNames[drillKey];
  const [remaining, setRemaining] = useState(durationSeconds);
  const [timerActive, setTimerActive] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [rewards, setRewards] = useState(loadRewards);
  const [feedback, setFeedback] = useState('');
  const alreadyCompleted = rewards.date === todayKey() && rewards.completed.includes(positionCode);
  const demoStepIndex = Math.min(drill.steps.length - 1, Math.floor(demoProgress * drill.steps.length));
  const playerLevel = Math.floor(rewards.totalXp / 100) + 1;
  const xpIntoLevel = rewards.totalXp % 100;

  useEffect(() => {
    setRemaining(durationSeconds);
    setTimerActive(false);
    setDemoPlaying(false);
    setDemoProgress(0);
    setFeedback('');
  }, [positionCode]);

  useEffect(() => {
    if (!timerActive || remaining === 0) return undefined;
    const timeout = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [timerActive, remaining]);

  useEffect(() => {
    if (remaining === 0) setTimerActive(false);
  }, [remaining]);

  useEffect(() => {
    if (!demoPlaying) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = window.setInterval(() => setDemoProgress((progress) => (progress + (reducedMotion ? 1 / drill.steps.length : 1 / 240)) % 1), reducedMotion ? 3000 : 50);
    return () => window.clearInterval(interval);
  }, [demoPlaying, drill.steps.length]);

  function chooseDemoStep(index) {
    const step = Math.max(0, Math.min(drill.steps.length - 1, index));
    setDemoPlaying(false);
    setDemoProgress(step / drill.steps.length);
  }

  async function completeDrill() {
    if (!trackingExercise || alreadyCompleted || saving) return;
    setFeedback('');
    const saved = await onComplete(trackingExercise, `At-home position drill: ${drill.title}`);
    if (!saved) {
      setFeedback('Your session was not saved yet. Check your connection and try again.');
      return;
    }
    const nextRewards = {
      totalXp: rewards.totalXp + 50,
      date: todayKey(),
      todayXp: (rewards.date === todayKey() ? rewards.todayXp : 0) + 50,
      completed: [...(rewards.date === todayKey() ? rewards.completed : []), positionCode],
    };
    setRewards(nextRewards);
    try { localStorage.setItem(rewardKey, JSON.stringify(nextRewards)); } catch { /* Keep this session's reward in memory. */ }
    setFeedback('Drill complete. You earned 50 XP. Nice work.');
  }

  return <section className="position-drill-lab" aria-labelledby="position-drill-title">
    <header className="position-drill-header">
      <div><p className="position-drill-eyebrow"><i /> AT-HOME POSITION DRILL / {positionCode}</p><h3 id="position-drill-title">{drill.title}</h3><p>One focused session for your {positionNames[positionCode] || 'position'} role.</p></div>
      <span className="position-drill-duration"><Timer size={15} /> 3 × 45 SEC</span>
    </header>

    <div className="position-drill-summary"><div><small>SKILL FOCUS</small><strong>{drill.focus}</strong></div><div><small>SPACE</small><strong>{drill.space}</strong></div></div>

    <div className="position-drill-overview">
      <div className="position-drill-media">
        <div className="position-video-controls" aria-label="Drill demonstration controls">
          <button type="button" className="position-video-toggle" onClick={() => setDemoPlaying(!demoPlaying)} aria-label={demoPlaying ? 'Pause visual' : 'Play visual'}>{demoPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}{demoPlaying ? 'Pause Visual' : 'Play Visual'}</button>
          <span>STEP {demoStepIndex + 1} / {drill.steps.length}</span>
          <button type="button" className="position-video-replay" onClick={() => { setDemoProgress(0); setDemoPlaying(true); }} aria-label="Replay visual" title="Replay"><RotateCcw size={15} /></button>
        </div>
        <div className="position-drill-visual">
          <ExerciseDiagram type={drill.diagram} title={drill.title} animationProgress={demoProgress} />
        </div>
        <div className="position-video-legend" aria-label="Pitch map legend"><span><i className="legend-player" />Player</span><span><i className="legend-cone" />Cone</span><span><i className="legend-target" />Target</span><span><i className="legend-route" />Route</span></div>
        <section className="position-video-guide" aria-labelledby="position-video-guide-title"><h4 id="position-video-guide-title"><span>STEP-BY-STEP GUIDE</span><small>Tap a step to watch it</small></h4><ol>{drill.steps.map((step, index) => <li key={step}><button type="button" className={index === demoStepIndex ? 'position-video-step-active' : ''} aria-current={index === demoStepIndex ? 'step' : undefined} onClick={() => chooseDemoStep(index)}><span>{index + 1}</span><div><strong>{stageNames[index]}</strong><p>{step}</p></div></button></li>)}</ol></section>
      </div>
      <aside className="position-coach" aria-label="Virtual coach">
        <div className="position-coach-heading"><span><Sparkles size={16} /></span><div><small>YOUR VIRTUAL COACH</small><strong>Coach's cue</strong></div></div>
        <p>“{drill.coach}”</p>
        <div className="position-coach-tip"><strong>PRO TIP</strong><span>{drill.tip}</span></div>
      </aside>
    </div>

    <div className="position-drill-work">
      <section className="position-drill-steps"><p className="position-drill-safety"><strong>Train safely:</strong> {drill.safety}</p>{ageBand?.scale && <p className="position-drill-age"><strong>{ageBand.label}:</strong> {ageBand.scale}</p>}</section>
        <aside className="position-drill-timer"><div className="position-drill-section-heading"><span><Timer size={15} /></span><h4>DRILL TIMER</h4></div><p className="position-timer-display" aria-live="polite">{`00:${String(remaining).padStart(2, '0')}`}</p><p className="position-timer-caption">{remaining === 0 ? 'Set complete. Take a short rest.' : 'Recommended: 3 sets × 45 seconds'}</p><div className="position-timer-controls"><button type="button" className="position-timer-primary" onClick={() => { if (remaining === 0) { setRemaining(durationSeconds); setTimerActive(true); return; } setTimerActive(!timerActive); }} aria-label={timerActive ? 'Pause drill timer' : remaining === 0 ? 'Restart drill timer' : 'Start drill timer'}>{timerActive ? <Pause size={16} /> : <Play size={16} />}{timerActive ? 'Pause timer' : remaining === 0 ? 'Restart timer' : 'Start timer'}</button><button type="button" className="position-timer-reset" onClick={() => { setTimerActive(false); setRemaining(durationSeconds); }} aria-label="Reset drill timer" title="Reset timer"><RotateCcw size={16} /></button></div><div className="position-streak-line"><Flame size={16} /><span><strong>{streakDays}</strong> day{streakDays === 1 ? '' : 's'} active streak</span></div></aside>
    </div>

    <footer className="position-drill-footer"><div className="position-xp-summary"><span className="position-xp-icon"><Trophy size={17} /></span><div className="position-xp-copy"><div className="position-xp-heading"><strong>{rewards.totalXp} XP</strong><span>LEVEL {playerLevel}</span></div><small>{rewards.todayXp} XP today · {xpIntoLevel}/100 to next level</small><span className="position-level-track" role="progressbar" aria-label="Progress to next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow={xpIntoLevel}><span style={{ width: `${xpIntoLevel}%` }} /></span></div></div><button type="button" className={`position-drill-complete ${alreadyCompleted ? 'is-complete' : ''}`} onClick={completeDrill} disabled={!trackingExercise || saving || alreadyCompleted}>{saving ? 'Saving session…' : alreadyCompleted ? <><Check size={16} /> Complete today</> : <><Check size={16} /> Drill Complete <span>+50 XP</span></>}</button></footer>
    {feedback && <p className={`position-drill-feedback ${alreadyCompleted ? 'success' : ''}`} role="status">{feedback}</p>}
    {!trackingExercise && <p className="position-drill-feedback" role="status">{loading ? 'Loading position sessions…' : 'No saved session is available for this position yet.'}</p>}
  </section>;
}