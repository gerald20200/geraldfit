import { Brain, HeartPulse, MessageCircle, ShieldPlus, Sparkles, Target, Users, Zap } from 'lucide-react';
import { useState } from 'react';

const sections = [
  { id: 'physical', title: 'Physical performance', Icon: Zap, modules: [
    { title: 'Speed and acceleration', time: '12 min', goal: 'Create a strong first five metres without losing sprint shape.', steps: ['Complete 3 minutes of dynamic movement.', 'Do 4 x 10 m accelerations at 80% effort; walk back and rest 45 seconds.', 'Finish with 3 starts from different football stances.'], cue: 'Drive the first steps back into the ground, keep the torso inclined, then rise naturally.', level: 'Beginner to advanced', safety: 'Use a flat, clear surface. Stop if your stride becomes painful or unstable.' },
    { title: 'Stamina and repeat efforts', time: '15 min', goal: 'Practise recovering between short football actions.', steps: ['Jog easily for 3 minutes.', 'Complete 6 rounds of 20 seconds brisk movement and 40 seconds walking.', 'Finish with 2 minutes of easy walking.'], cue: 'You should be able to speak a short sentence during recovery; build volume gradually.', level: 'All levels', safety: 'Reduce the work interval if you feel dizzy, unwell, or unusually breathless.' },
    { title: 'Strength and balance', time: '14 min', goal: 'Build stable single-leg control for turns, tackles, and landing.', steps: ['Do 2 x 8 controlled bodyweight squats.', 'Do 2 x 6 reverse lunges each leg, using support if needed.', 'Balance on one leg for 3 x 20 seconds each side.'], cue: 'Keep knee tracking over toes, hips level, and the whole foot connected to the ground.', level: 'Beginner to intermediate', safety: 'Bodyweight only; stop if you feel joint pain. Young athletes should have a qualified adult supervise.' },
    { title: 'Agility and coordination', time: '10 min', goal: 'Change direction with control before adding speed.', steps: ['Set 4 markers in a square.', 'Move forward, sideways, and backward around the square for 4 x 20 seconds.', 'Rest 40 seconds and keep each turn balanced.'], cue: 'Brake with short steps before changing direction; do not let the knee collapse inward.', level: 'All levels', safety: 'Leave clear space around markers and avoid slippery ground.' },
  ] },
  { id: 'intelligence', title: 'Football intelligence', Icon: Brain, modules: [
    { title: 'Scan, decide, act', time: '8 min', goal: 'Connect visual information to a quick next action.', steps: ['Place two coloured targets in view.', 'Before each wall return, scan over both shoulders.', 'Call a target, receive on the back foot, and pass toward it for 3 x 6 reps.'], cue: 'Scan early enough to know the next action before the ball arrives.', level: 'Beginner to advanced', safety: 'Start slowly; increase decision speed only while first touch remains controlled.' },
    { title: 'Tactical picture: space and cover', time: '10 min', goal: 'Recognise when to press, cover, or protect space.', steps: ['Sketch a simple 3v2 or 4v3 picture on paper.', 'Mark the ball, nearest defender, cover player, and open passing lane.', 'For 5 situations, say whether you press, cover, or hold and explain why.'], cue: 'Prioritise the most dangerous space, then communicate the choice clearly.', level: 'All levels', safety: 'This is a low-load learning session; take a break if concentration drops.' },
  ] },
  { id: 'team-mind', title: 'Team and mindset', Icon: Users, modules: [
    { title: 'Communication habits', time: '8 min', goal: 'Use short, early information that helps teammates act.', steps: ['Choose three useful calls: “man on”, “turn”, and “time”.', 'Practise each before receiving a wall pass or partner pass.', 'After each set, name the next available support option.'], cue: 'Be early, specific, and calm. Communication should improve the next action.', level: 'All levels', safety: 'Use a partner only if the area is safe and the activity is controlled.' },
    { title: 'Confidence reset routine', time: '5 min', goal: 'Recover focus after a mistake and prepare for the next action.', steps: ['Take one slow breath out.', 'Name one controllable cue, such as “scan early”.', 'Visualise one successful action, then restart with an easy repetition.'], cue: 'Confidence grows from repeatable preparation, not from demanding perfection.', level: 'All levels', safety: 'If football is causing persistent distress, talk with a trusted adult or qualified professional.' },
  ] },
  { id: 'recovery', title: 'Injury prevention and recovery', Icon: HeartPulse, modules: [
    { title: 'Warm-up and cool-down', time: '10 min', goal: 'Prepare gradually and bring effort down after training.', steps: ['Start with 3 minutes of easy movement.', 'Add dynamic ankle, hip, and shoulder movements for 3 minutes.', 'Build into 3 short progressive accelerations.', 'After training, walk easily for 2 minutes and gently move through comfortable ranges.'], cue: 'Warm-up movements should prepare the actions of the session; they should not be painful.', level: 'All levels', safety: 'A warm-up does not guarantee injury prevention. Stop for sharp pain or illness.' },
    { title: 'Rest, hydration, and return to play', time: '6 min', goal: 'Understand the basics of recovering between sessions.', steps: ['Drink to thirst and eat regular balanced meals.', 'Plan a rest or light day after demanding training.', 'Return gradually after time away rather than doubling missed work.'], cue: 'Sleep, food, and recovery days are part of development, not lost training.', level: 'All levels', safety: 'This is general education, not medical advice. Do not train through pain or return from injury without appropriate clinical guidance.' },
  ] },
];

const iconByModule = [Target, ShieldPlus, MessageCircle, Sparkles, Brain, HeartPulse, Zap, Users, ShieldPlus, HeartPulse];

export default function DevelopmentCentre() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const section = sections.find((item) => item.id === activeSection) || sections[0];
  const SectionIcon = section.Icon;
  return <section className="development-centre" aria-labelledby="development-centre-title">
    <div className="development-intro"><div><p className="eyebrow"><i /> COMPLETE PLAYER DEVELOPMENT</p><h3 id="development-centre-title">TRAIN THE <span>WHOLE PLAYER</span></h3><p>Short, practical lessons for the body, the game, the team, and long-term wellbeing.</p></div><div className="development-stamp"><SectionIcon size={20} /><span>LEARN<br />THEN APPLY</span></div></div>
    <div className="development-tabs" role="tablist" aria-label="Development topics">{sections.map(({ id, title, Icon }) => <button key={id} role="tab" aria-selected={activeSection === id} className={activeSection === id ? 'development-tab-active' : ''} onClick={() => setActiveSection(id)}><Icon size={15} /><span>{title}</span></button>)}</div>
    <div className="development-module-grid">{section.modules.map((module, index) => {
      const ModuleIcon = iconByModule[sections.flatMap((item) => item.modules).findIndex((candidate) => candidate.title === module.title)] || Sparkles;
      return <article className="development-module" key={module.title}>
        <div className="development-module-top"><span className="development-module-icon"><ModuleIcon size={17} /></span><span className="development-duration">{module.time}</span><span className="development-index">{String(index + 1).padStart(2, '0')}</span></div>
        <h4>{module.title}</h4><p className="development-goal">{module.goal}</p>
        <ol>{module.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="development-coach-cue"><strong>COACHING CUE</strong><span>{module.cue}</span></div>
        <div className="development-module-bottom"><span>{module.level}</span><details><summary>Safety note</summary><p>{module.safety}</p></details></div>
      </article>;
    })}</div>
  </section>;
}