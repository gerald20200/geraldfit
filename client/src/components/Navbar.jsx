import { ArrowUpRight, CircleUserRound, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ solid = false }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function signOut() { logout(); navigate('/'); }
  return <header className={`site-header ${solid ? 'site-header-solid' : ''}`}>
    <div className="nav-inner"><Link className="brand" to="/" aria-label="Geraldfit home"><span className="brand-mark">G</span><span>GERALD<span className="brand-light">FIT</span></span></Link>
      <button className="icon-button mobile-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        {user ? <><NavLink to="/dashboard" onClick={() => setOpen(false)}>Training hub</NavLink>{user.isAdmin && <NavLink to="/admin" onClick={() => setOpen(false)}><ShieldCheck size={15} /> Admin</NavLink>}<span className="nav-user"><CircleUserRound size={17} />{user.fullName?.split(' ')[0]}</span><button className="nav-logout" onClick={signOut}><LogOut size={15} /> Sign out</button></> : <><a href="/#training" onClick={() => setOpen(false)}>Training</a><a href="/#method" onClick={() => setOpen(false)}>The method</a><Link to="/auth" className="nav-signin" onClick={() => setOpen(false)}>Sign in <ArrowUpRight size={15} /></Link></>}
      </nav>
    </div>
  </header>;
}