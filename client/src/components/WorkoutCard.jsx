import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkoutCard({ workout }) {
  return <article className="workout-card">
    <div className="workout-art" style={{ backgroundImage: `linear-gradient(180deg,rgba(15,23,42,.05),rgba(15,23,42,.72)),url('${workout.image_url || ''}')` }}><span className="category-tag">{workout.category}</span><span className="art-index">{workout.title.slice(0, 2).toUpperCase()}</span></div>
    <div className="workout-card-body"><div className="workout-card-meta"><span>{workout.difficulty}</span><span><Clock3 size={13} /> {workout.duration_minutes} min</span></div><h3>{workout.title}</h3><p>{workout.description}</p><Link className="card-action" to={`/workout/${workout.id}`}>View session <ArrowUpRight size={16} /></Link></div>
  </article>;
}