import { ArrowDown, ArrowRight, ArrowUpRight, CirclePlay, Dumbbell, Footprints, MoveUpRight, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import WorkoutCard from '../components/WorkoutCard.jsx';
import api from '../lib/api.js';
import '../styles/showcase.css';

const focuses = [
  { n: '01', label: 'CONTROL', title: 'First touch', copy: 'Own the ball before the game asks you to.', Icon: Footprints, tone: 'green' },
  { n: '02', label: 'AGILITY', title: 'Change pace', copy: 'Create a yard of space, then take it.', Icon: Zap, tone: 'gold' },
  { n: '03', label: 'CONDITIONING', title: 'Build your engine', copy: 'Stay sharp long after the first whistle.', Icon: Dumbbell, tone: 'blue' },
];

const featuredDrills = [
  { id: '56c1120a-e96f-4ccd-a2dc-7ed0501f8d01', title: 'Cone Weave & Explode', category: 'Agility', duration_minutes: 15, difficulty: 'Beginner', description: 'Build quick feet and a powerful first step.', image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80' },
  { id: '56c1120a-e96f-4ccd-a2dc-7ed0501f8d02', title: 'Close-Control Circuit', category: 'Dribbling', duration_minutes: 12, difficulty: 'Intermediate', description: 'Keep the ball close while changing direction.', image_url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80' },
  { id: '56c1120a-e96f-4ccd-a2dc-7ed0501f8d03', title: 'First Touch & Turn', category: 'Passing', duration_minutes: 15, difficulty: 'Beginner', description: 'Receive and turn into space with confidence.', image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80' },
];

export default function LandingPage() {
  const [drills, setDrills] = useState(featuredDrills);
  useEffect(() => {
    api.get('/workouts').then(({ data }) => {
      if (data.workouts?.length) setDrills(data.workouts.slice(0, 3));
    }).catch(() => {});
  }, []);

  return <div className="landing-page"><Navbar /><main>
    <section className="hero-section"><div className="hero-photo" /><div className="hero-overlay" /><div className="hero-content page-width"><p className="eyebrow"><i /> THE WORK STARTS HERE</p><h1>BETTER PLAYERS<br /><span>ARE BUILT</span><br />OFF THE PITCH.</h1><div className="hero-bottom"><p>Purpose-built football training for the space you have and the player you want to become.</p><Link className="button button-primary" to="/auth">Start training <ArrowUpRight size={18} /></Link></div><a className="hero-scroll" href="#training"><ArrowDown size={16} /> SCROLL TO TRAIN</a><div className="hero-coordinate">TRAIN ANYWHERE<span>EST. FOR THE EVERYDAY PLAYER</span></div></div><div className="hero-number">GF<span> / 01</span></div></section>
    <div className="ticker"><div>TRAIN WITH PURPOSE <b>✳</b> REPEAT WITH INTENT <b>✳</b> SHOW UP AGAIN <b>✳</b> TRAIN WITH PURPOSE <b>✳</b> REPEAT WITH INTENT <b>✳</b> SHOW UP AGAIN <b>✳</b></div></div>
    <section className="training-section page-width" id="training"><div className="section-heading"><div><p className="eyebrow"><i /> YOUR GAME, YOUR WORK</p><h2>TRAIN FOR<br /><span>THE MOMENT.</span></h2></div><p className="section-intro">Short, focused sessions turn the fundamentals into second nature. Pick your focus and get to work.</p></div><div className="training-grid">{focuses.map(({ n, label, title, copy, Icon, tone }) => <article className={`training-tile tile-${tone}`} key={n}><div className="tile-top"><span>{n} / 03</span><Icon size={22} strokeWidth={1.6} /></div><p className="tile-label">{label}</p><h3>{title}</h3><p className="tile-text">{copy}</p><Link className="tile-link" to="/auth" aria-label={`Train ${title}`}><ArrowUpRight size={18} /></Link></article>)}</div></section>
    <section className="drill-showcase page-width"><div className="section-heading"><div><p className="eyebrow"><i /> THE SESSION LIBRARY</p><h2>START WITH<br /><span>THE BASICS.</span></h2></div><p className="section-intro">A few metres, a ball, and a plan. Here are three ways to make today's work count.</p></div><div className="workout-grid">{drills.map((workout) => <WorkoutCard key={workout.id} workout={workout} />)}</div><Link className="text-link showcase-link" to="/auth">Explore your training plan <ArrowRight size={16} /></Link></section>
    <section className="method-section" id="method"><div className="method-image" /><div className="method-copy"><p className="eyebrow"><i /> THE GERALDFIT METHOD</p><h2>SMALL SPACE.<br /><span>BIG INTENTION.</span></h2><p>No perfect pitch required. Every session is designed to work at home, in the park, or wherever you can find a few metres and a reason to improve.</p><div className="method-stat"><strong>15<span>MIN</span></strong><span>is enough to move<br />your game forward.</span></div><Link className="text-link" to="/auth">Find your next session <ArrowRight size={17} /></Link></div></section>
    <section className="closing-cta page-width"><div><p className="eyebrow"><i /> YOUR NEXT SESSION IS WAITING</p><h2>MAKE THE<br /><span>MINUTES COUNT.</span></h2></div><Link className="button button-primary" to="/auth"><CirclePlay size={18} /> Get started <MoveUpRight size={17} /></Link></section>
  </main><footer className="site-footer page-width"><Link className="brand" to="/"><span className="brand-mark">G</span><span>GERALD<span className="brand-light">FIT</span></span></Link><span>Built for the love of the game.</span><span>© {new Date().getFullYear()} Geraldfit</span></footer></div>;
}