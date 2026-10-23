import { createContext, useContext, useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BarChart3, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Dumbbell, Flame,
  Heart, Home, LogOut, Menu, MessageCircle, Minus, Plus, ShieldCheck, Sparkles, Target,
  UserRound, Users, X, Eye, EyeOff, Zap,
} from 'lucide-react'
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile,
} from 'firebase/auth'
import { auth, getFirestoreDb } from './firebase'

const AuthContext = createContext(null)
const demoModeEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'
const navItems = [
  { path: '/app/home', label: 'Overview', icon: Home },
  { path: '/app/trainer', label: 'Your coach', icon: UserRound },
  { path: '/app/workout', label: 'Workout builder', icon: Dumbbell },
  { path: '/app/calculator', label: 'Macro calculator', icon: BarChart3 },
  { path: '/app/services', label: 'Coaching plans', icon: Target },
  { path: '/app/prompts', label: 'AI prompt studio', icon: Sparkles },
  { path: '/app/stories', label: 'Client stories', icon: Heart },
  { path: '/app/guides', label: 'Training journal', icon: BookOpen },
  { path: '/app/booking', label: 'Book a session', icon: CalendarDays },
]

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demo = demoModeEnabled && sessionStorage.getItem('geraldfit-demo') === 'true'
    if (!demo) sessionStorage.removeItem('geraldfit-demo')
    if (demo) setUser({ uid: 'demo-user', displayName: 'Gerald', email: 'gerald@example.com', photoURL: '' })
    if (!auth) {
      setLoading(false)
      return undefined
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!sessionStorage.getItem('geraldfit-demo')) setUser(firebaseUser)
      setLoading(false)
    })
  }, [])

  async function login(email, password) {
    if (!auth) throw new Error('Firebase is not configured yet. Add your VITE_FIREBASE values, or use Demo Mode.')
    sessionStorage.removeItem('geraldfit-demo')
    const result = await signInWithEmailAndPassword(auth, email, password)
    setUser(result.user)
  }

  async function register(name, email, password) {
    if (!auth) throw new Error('Firebase is not configured yet. Add your VITE_FIREBASE values, or use Demo Mode.')
    sessionStorage.removeItem('geraldfit-demo')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    setUser({ ...result.user, displayName: name })
  }

  async function googleLogin() {
    if (!auth) throw new Error('Firebase is not configured yet. Add your VITE_FIREBASE values, or use Demo Mode.')
    sessionStorage.removeItem('geraldfit-demo')
    const result = await signInWithPopup(auth, new GoogleAuthProvider())
    setUser(result.user)
  }

  async function demoLogin() {
    if (!demoModeEnabled) throw new Error('Demo Mode is disabled for this deployment.')
    sessionStorage.setItem('geraldfit-demo', 'true')
    setUser({ uid: 'demo-user', displayName: 'Gerald', email: 'gerald@example.com', photoURL: '' })
  }

  async function logout() {
    sessionStorage.removeItem('geraldfit-demo')
    if (auth?.currentUser) await signOut(auth)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, googleLogin, demoLogin, logout }}>{children}</AuthContext.Provider>
}

function useAuth() { return useContext(AuthContext) }

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-zinc-950 text-cyan-400"><Activity className="animate-pulse" /></div>
  return user ? children : <Navigate to="/" replace />
}

function AuthPortal() {
  const { user, login, register, googleLogin, demoLogin } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) navigate('/app/home', { replace: true }) }, [user, navigate])

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'register' && name.trim().length < 2) return setError('Add your name to create your account.')
    setBusy(true)
    try {
      if (mode === 'register') await register(name.trim(), email, password)
      else await login(email, password)
    } catch (exception) { setError(friendlyAuthError(exception)) }
    finally { setBusy(false) }
  }

  async function handleGoogle() {
    setError(''); setBusy(true)
    try { await googleLogin() } catch (exception) { setError(friendlyAuthError(exception)) }
    finally { setBusy(false) }
  }

  return (
    <main className="auth-backdrop app-grain flex min-h-screen items-center px-5 py-8 sm:px-10 lg:px-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1fr_410px]">
        <section className="hidden max-w-2xl lg:block rise-in">
          <Brand />
          <div className="mt-24 max-w-xl">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-cyan-400"><span className="h-px w-8 bg-cyan-400" /> Training, made personal</p>
            <h1 className="font-display text-6xl font-extrabold leading-[1.03] tracking-tight xl:text-7xl">Built around <span className="text-cyan-400">you.</span><br />Made to last.</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-stone-300">Real coaching. Thoughtful programming. A stronger life, one session at a time.</p>
            <div className="mt-12 flex items-center gap-4 text-sm text-stone-200"><div className="flex -space-x-2">{['photo-1534528741775-53994a69daeb','photo-1500648767791-00dcc994a43e','photo-1531123897727-8f129e1688ce'].map((photo) => <img key={photo} className="h-9 w-9 rounded-full border-2 border-zinc-950 object-cover" src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=96&q=80`} alt="Geraldfit member" />)}</div><span><b className="text-white">1,200+</b> people moving better</span></div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-md rise-in">
          <div className="mb-8 lg:hidden"><Brand /></div>
          <div className="border-b border-white/10 pb-5">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-400">Your next chapter starts here</p>
            <h2 className="mt-2 font-display text-3xl font-bold">{mode === 'login' ? 'Welcome back.' : 'Make it official.'}</h2>
            <p className="mt-2 text-sm text-stone-400">{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create an account and meet your new routine.'}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 border-b border-white/10">
            {['login', 'register'].map((tab) => <button key={tab} onClick={() => { setMode(tab); setError('') }} className={`border-b-2 py-3 text-sm font-semibold capitalize transition ${mode === tab ? 'border-cyan-400 text-white' : 'border-transparent text-stone-500 hover:text-white'}`}>{tab}</button>)}
          </div>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            {mode === 'register' && <label className="block text-sm font-medium text-stone-300">Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Jordan Lee" /></label>}
            <label className="block text-sm font-medium text-stone-300">Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" /></label>
            <label className="block text-sm font-medium text-stone-300">Password<div className="relative"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} placeholder="At least 6 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-stone-500 hover:text-white">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <p role="alert" className="rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 bg-cyan-400 px-4 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-[#67e8f9] disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17} /></button>
          </form>
          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-stone-600"><span className="h-px flex-1 bg-white/10" />Or continue with<span className="h-px flex-1 bg-white/10" /></div>
          <button disabled={busy} onClick={handleGoogle} className="flex w-full items-center justify-center gap-3 border border-white/15 px-4 py-3 text-sm font-semibold text-stone-200 transition hover:border-white/35 hover:bg-white/[.04]"><GoogleMark />Continue with Google</button>
          {demoModeEnabled && <button onClick={async () => { await demoLogin(); navigate('/app/home', { replace: true }) }} className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-stone-400 transition hover:text-cyan-400"><Zap size={16} />Try Demo Mode</button>}
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-stone-600"><ShieldCheck size={13} /> Your details stay private and secure</p>
        </section>
      </div>
    </main>
  )
}

function friendlyAuthError(error) {
  const messages = {
    'auth/invalid-credential': 'That email and password combination was not recognized.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
    'auth/unauthorized-domain': 'Add this domain to Firebase Authentication’s authorized domains.',
  }
  return messages[error?.code] || error?.message || 'Something went wrong. Please try again.'
}

function GoogleMark() { return <span aria-hidden="true" className="font-display text-base font-extrabold text-white">G</span> }
function Brand({ compact = false }) { return <Link to="/app/home" className="inline-flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center bg-cyan-400 text-zinc-950"><Activity size={20} strokeWidth={2.5} /></span><span className="font-display text-lg font-extrabold tracking-tight text-white">Gerald<span className="text-cyan-400">fit</span>{!compact && <span className="ml-2 hidden text-[10px] font-medium uppercase tracking-[.16em] text-stone-500 sm:inline">Personal training</span>}</span></Link> }
const inputClass = 'mt-2 w-full border border-white/15 bg-zinc-900 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-stone-600 focus:border-cyan-400'

function AppShell() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Athlete'

  async function handleLogout() { await logout(); navigate('/', { replace: true }) }

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-100">
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 backdrop-blur-md sm:px-7">
        <div className="flex items-center gap-7"><Brand /><div className="hidden h-7 w-px bg-white/10 xl:block" /><span className="hidden text-xs text-stone-500 xl:block">ELITE PERSONAL TRAINING & COACHING</span></div>
        <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-stone-200">{displayName}</p><p className="mt-0.5 text-[10px] uppercase tracking-wider text-cyan-400">{user?.uid === 'demo-user' ? 'Demo member' : 'Member'}</p></div><div className="grid h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-zinc-900 text-xs font-bold text-cyan-400 place-items-center">{user?.photoURL ? <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}</div><button title="Sign out" aria-label="Sign out" onClick={handleLogout} className="ml-1 grid h-9 w-9 place-items-center text-stone-400 transition hover:bg-white/5 hover:text-white"><LogOut size={17} /></button><button aria-label="Open navigation" onClick={() => setMobileOpen((value) => !value)} className="ml-1 grid h-9 w-9 place-items-center text-stone-300 lg:hidden">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[238px] shrink-0 flex-col border-r border-white/10 px-3 py-6 lg:flex">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-stone-600">Your space</p>
          <nav className="space-y-1">{navItems.map((item) => <NavigationItem key={item.path} item={item} />)}</nav>
          <div className="mt-auto border-t border-white/10 pt-4"><div className="flex items-start gap-2.5 px-3 text-stone-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-cyan-400" /><p className="text-[11px] leading-5">Built for consistency.<br />Backed by real coaching.</p></div></div>
        </aside>
        {mobileOpen && <div className="fixed inset-x-0 top-[68px] z-40 border-b border-white/10 bg-zinc-950 px-4 py-4 shadow-2xl lg:hidden"><nav className="grid grid-cols-2 gap-1 sm:grid-cols-3">{navItems.map((item) => <NavigationItem key={item.path} item={item} onClick={() => setMobileOpen(false)} />)}</nav></div>}
        <main className="min-w-0 flex-1 px-4 pb-14 pt-6 sm:px-7 sm:pt-8 lg:px-10"><Routes>
          <Route path="home" element={<Dashboard user={user} />} />
          <Route path="trainer" element={<Trainer />} />
          <Route path="workout" element={<WorkoutBuilder />} />
          <Route path="calculator" element={<MacroCalculator />} />
          <Route path="services" element={<Services />} />
          <Route path="prompts" element={<PromptStudio />} />
          <Route path="stories" element={<Stories />} />
          <Route path="guides" element={<Guides />} />
          <Route path="booking" element={<Booking user={user} />} />
          <Route path="*" element={<Navigate to="/app/home" replace />} />
        </Routes></main>
      </div>
    </div>
  )
}

function NavigationItem({ item, onClick }) {
  const Icon = item.icon
  return <NavLink onClick={onClick} to={item.path} className={({ isActive }) => `flex items-center gap-3 border-l-2 px-3 py-2.5 text-[13px] transition ${isActive ? 'border-cyan-400 bg-white/[.045] font-semibold text-white' : 'border-transparent text-stone-500 hover:bg-white/[.03] hover:text-stone-200'}`}><Icon size={16} strokeWidth={1.8} /><span>{item.label}</span>{item.path === '/app/booking' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}</NavLink>
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-cyan-400">{eyebrow}</p><h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{description}</p>}</div>{action}</div>
}

function SectionLabel({ children, action }) { return <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-sm font-bold uppercase tracking-[.12em] text-stone-300">{children}</h2>{action}</div> }
function Stat({ icon: Icon, label, value, change, color = 'text-cyan-400' }) { return <div className="border-t border-white/15 pt-4"><div className={`mb-3 flex items-center gap-2 text-xs ${color}`}><Icon size={15} /><span className="font-semibold text-stone-400">{label}</span></div><p className="font-display text-3xl font-extrabold text-white">{value}</p><p className="mt-1 text-xs text-stone-600">{change}</p></div> }
function ActionLink({ to, children }) { return <Link to={to} className="group inline-flex items-center gap-2 text-xs font-bold text-cyan-400 transition hover:text-white">{children}<ArrowRight size={14} className="transition group-hover:translate-x-1" /></Link> }

function Dashboard({ user }) {
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Athlete'
  return <div className="rise-in">
    <div className="hero-photo relative min-h-[310px] overflow-hidden border border-white/10 px-6 py-8 sm:min-h-[350px] sm:px-10 sm:py-10"><div className="relative z-10 max-w-xl"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-cyan-400"><span className="h-px w-7 bg-cyan-400" />Your training, your terms</p><h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">Show up for <span className="text-cyan-400">yourself,</span><br />{firstName}.</h1><p className="mt-4 max-w-md text-sm leading-6 text-stone-300">Small, repeatable efforts make the strongest kind of progress. Let's make this week count.</p><Link to="/app/workout" className="mt-7 inline-flex items-center gap-2 bg-cyan-400 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-zinc-950 transition hover:bg-white">Build this week <ArrowRight size={15} /></Link></div><div className="absolute bottom-6 right-7 hidden border-l border-cyan-400/60 pl-3 text-xs text-white/60 md:block"><span className="block text-2xl font-extrabold text-white">01<span className="text-cyan-400">/</span>01</span>Progress starts today</div></div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-white/10 py-7 md:grid-cols-4"><Stat icon={Flame} label="Streak" value="04 days" change="One day at a time" /><Stat icon={Dumbbell} label="Sessions" value="12" change="This month" color="text-cyan-400" /><Stat icon={ArrowUpRight} label="Consistency" value="86%" change="Up 8% from last month" color="text-cyan-400" /><Stat icon={Target} label="Next milestone" value="Today" change="Lower body · 45 min" color="text-cyan-400" /></div>
    <div className="grid gap-10 py-8 xl:grid-cols-[1.3fr_.7fr]">
      <section><SectionLabel action={<ActionLink to="/app/workout">View plan</ActionLink>}>This week's rhythm</SectionLabel><div className="divide-y divide-white/10 border-y border-white/10">{[{day:'MON',name:'Lower body strength',time:'45 min',status:'Complete'},{day:'WED',name:'Upper body + core',time:'50 min',status:'Up next'},{day:'FRI',name:'Full body conditioning',time:'40 min',status:'Planned'}].map((session,index)=><div key={session.day} className="flex items-center gap-4 py-4"><div className={`w-12 text-center ${index===1?'text-cyan-400':'text-stone-600'}`}><span className="block text-[10px] font-bold tracking-widest">{session.day}</span><span className="mt-1 block text-xl font-extrabold text-white">{12+index*2}</span></div><div className="h-8 w-px bg-white/10"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-stone-200">{session.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><Clock3 size={12}/>{session.time}</p></div><span className={`text-[10px] font-bold uppercase tracking-wider ${index===1?'text-cyan-400':'text-stone-600'}`}>{session.status}</span></div>)}</div></section>
      <section><SectionLabel>Keep your momentum</SectionLabel><div className="space-y-5 border-l border-white/10 pl-5"><QuickLink to="/app/calculator" icon={BarChart3} title="Know your numbers" text="Set a calorie and macro baseline."/><QuickLink to="/app/booking" icon={CalendarDays} title="Talk it through" text="Book a complimentary intro call."/><QuickLink to="/app/guides" icon={BookOpen} title="Learn as you go" text="Practical guides for real life."/></div></section>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-stone-500"><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-cyan-400"/> Coaching that adapts to real life.</span><ActionLink to="/app/trainer">Meet your coach</ActionLink></div>
  </div>
}
function QuickLink({ to, icon: Icon, title, text }) { return <Link to={to} className="group flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 text-cyan-400 transition group-hover:border-cyan-400"><Icon size={17}/></span><span><span className="flex items-center gap-2 text-sm font-semibold text-stone-200">{title}<ArrowUpRight size={13} className="text-stone-600 group-hover:text-cyan-400"/></span><span className="mt-1 block text-xs text-stone-500">{text}</span></span></Link> }

function Trainer() {
  const pillars = [{ icon: Heart, title: 'Train with purpose', text: 'Every rep earns its place. Your plan follows your goals, time, and starting point.' }, { icon: Activity, title: 'Progress over perfection', text: 'Consistency beats intensity. We build habits that hold up outside the gym.' }, { icon: Users, title: 'Coaching is a partnership', text: 'You bring the lived experience. I bring the structure, expertise, and honest feedback.' }]
  return <div className="rise-in"><PageHeading eyebrow="The human behind the plan" title="Your coach, in your corner." description="Good coaching starts by listening. Here's the approach behind every session and every plan."/><div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]"><div className="relative min-h-[390px] overflow-hidden bg-cover bg-center" style={{backgroundImage:"linear-gradient(0deg,rgba(17,20,17,.8),transparent 65%),url('https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=1000&q=85')"}}><div className="absolute bottom-6 left-6"><p className="font-display text-2xl font-extrabold">Gerald</p><p className="mt-1 text-xs uppercase tracking-[.18em] text-cyan-400">NASM-CPT · CES · CNC</p></div></div><div className="flex flex-col justify-center"><p className="max-w-xl text-lg leading-8 text-stone-200">“Fitness should make the rest of your life feel bigger, not smaller.”</p><p className="mt-5 max-w-xl text-sm leading-7 text-stone-400">I'm Gerald, a certified personal trainer with 10+ years helping everyday people feel at home in their bodies. No punishment workouts or one-size-fits-all plans: just thoughtful training, useful education, and accountability that meets you where you are.</p><div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/10 pt-5"><div><p className="font-display text-2xl font-extrabold text-cyan-400">10+</p><p className="mt-1 text-xs text-stone-500">Years coaching</p></div><div><p className="font-display text-2xl font-extrabold text-cyan-400">1.2k</p><p className="mt-1 text-xs text-stone-500">Client milestones</p></div></div></div></div><div className="mt-10"><SectionLabel>How we do things</SectionLabel><div className="grid gap-6 md:grid-cols-3">{pillars.map((pillar,index)=>{const Icon=pillar.icon;return <div key={pillar.title} className="border-t border-white/15 pt-5"><div className="flex items-center justify-between"><Icon size={20} className="text-cyan-400"/><span className="font-display text-2xl font-extrabold text-white/15">0{index+1}</span></div><h3 className="mt-4 font-display text-lg font-bold">{pillar.title}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{pillar.text}</p></div>})}</div></div></div>
}

const workoutDays = {
  'Fat loss': [['Strength A','Goblet squat · push-up · row'],['Conditioning','Intervals · carries · core'],['Strength B','Romanian deadlift · press · lunge'],['Full body','Circuit · step-up · plank'],['Zone 2 cardio','Steady pace · mobility'],['Strength C','Split squat · pulldown · bridge']],
  'Muscle gain': [['Upper strength','Bench press · row · overhead press'],['Lower strength','Squat · RDL · calf raise'],['Push volume','Incline press · lateral raise · triceps'],['Pull volume','Pulldown · cable row · curls'],['Leg volume','Leg press · hamstring curl · lunge'],['Arms + core','Curl · extension · loaded carry']],
  Endurance: [['Easy base','Steady aerobic · mobility'],['Intervals','Short efforts · full recovery'],['Strength','Single leg · core · posterior chain'],['Tempo','Sustained moderate effort'],['Easy base','Conversational pace · strides'],['Long session','Progressive steady distance']],
  Recomp: [['Full body A','Squat · bench · row'],['Zone 2 + core','Easy cardio · anti-rotation'],['Full body B','Deadlift · press · split squat'],['Intervals','Short work · long recovery'],['Full body C','Hip thrust · pulldown · push-up'],['Mobility + walk','Recovery · easy movement']],
}
function WorkoutBuilder() {
  const [goal, setGoal] = useState('Muscle gain')
  const [level, setLevel] = useState('Beginner')
  const [days, setDays] = useState(4)
  const [generated, setGenerated] = useState(false)
  const templates = workoutDays[goal] || workoutDays.Recomp
  const setCount = level === 'Beginner' ? '2–3 sets' : level === 'Intermediate' ? '3–4 sets' : '4–5 sets'
  const repCount = goal === 'Endurance' ? '8–12 reps' : level === 'Beginner' ? '8–12 reps' : '6–12 reps'
  return <div className="rise-in"><PageHeading eyebrow="AI-assisted programming" title="Build a week that fits." description="Start with a goal and training experience. Your plan is a flexible starting point, not a substitute for individualized coaching."/><div className="grid gap-9 xl:grid-cols-[.72fr_1.28fr]"><section className="border-t border-white/15 pt-5"><SectionLabel>Your starting point</SectionLabel><label className="mb-5 block text-xs font-semibold text-stone-400">Primary goal<select value={goal} onChange={e=>{setGoal(e.target.value);setGenerated(false)}} className={inputClass}>{['Fat loss','Muscle gain','Endurance','Recomp'].map(option=><option key={option}>{option}</option>)}</select></label><label className="mb-6 block text-xs font-semibold text-stone-400">Experience level<select value={level} onChange={e=>{setLevel(e.target.value);setGenerated(false)}} className={inputClass}>{['Beginner','Intermediate','Advanced'].map(option=><option key={option}>{option}</option>)}</select></label><div className="mb-6"><div className="mb-3 flex justify-between text-xs font-semibold text-stone-400"><span>Days per week</span><span className="text-cyan-400">{days} days</span></div><input type="range" min="3" max="6" value={days} onChange={e=>{setDays(Number(e.target.value));setGenerated(false)}} className="w-full accent-cyan-400"/><div className="mt-1 flex justify-between text-[10px] text-stone-600"><span>3 days</span><span>6 days</span></div></div><button onClick={()=>setGenerated(true)} className="flex w-full items-center justify-center gap-2 bg-cyan-400 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-zinc-950 hover:bg-white"><Sparkles size={15}/>Generate my week</button><p className="mt-3 text-[11px] leading-5 text-stone-600">Adjust exercises for injuries, equipment, and guidance from your healthcare professional.</p></section><section><SectionLabel action={generated&&<span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400"><CheckCircle2 size={14}/>Your plan</span>}>{generated?'Your training week':'Plan preview'}</SectionLabel><div className="divide-y divide-white/10 border-y border-white/10">{templates.slice(0,days).map((session,index)=><div key={session[0]} className="flex gap-3 py-4"><span className="w-11 shrink-0 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">Day 0{index+1}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{session[0]}</p><p className="mt-1 text-xs leading-5 text-stone-500">{session[1]}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600">{setCount} · {repCount} · 60–90 sec rest</p></div></div>)}</div><p className="mt-3 text-[10px] text-stone-600">Built for {goal.toLowerCase()} · {level.toLowerCase()} level · progressive overload encouraged</p></section></div></div>
}

function MacroCalculator() {
  const [age,setAge]=useState(30); const [gender,setGender]=useState('female'); const [weight,setWeight]=useState(68); const [unit,setUnit]=useState('kg'); const [height,setHeight]=useState(168); const [activity,setActivity]=useState(1.55); const [goal,setGoal]=useState('Maintain');
  const kg=unit==='kg'?Number(weight):Number(weight)*0.453592; const cm=Number(height); const bmr=gender==='male'?10*kg+6.25*cm-5*Number(age)+5:10*kg+6.25*cm-5*Number(age)-161; const tdee=Math.round(bmr*Number(activity)); const calories=Math.max(1200,Math.round(tdee+(goal==='Lose fat'?-400:goal==='Build muscle'?250:0))); const protein=Math.round(kg*(goal==='Build muscle'?2:1.8)); const fat=Math.round((calories*.27)/9); const carbs=Math.round((calories-protein*4-fat*9)/4);
  return <div className="rise-in"><PageHeading eyebrow="Your nutrition baseline" title="Find your numbers." description="A useful estimate for getting started. Your real needs vary with body composition, health, and day-to-day activity."/><div className="grid gap-10 xl:grid-cols-[.82fr_1.18fr]"><section className="border-t border-white/15 pt-5"><SectionLabel>About you</SectionLabel><div className="grid grid-cols-2 gap-4"><label className="text-xs font-semibold text-stone-400">Age<input type="number" min="15" max="100" value={age} onChange={e=>setAge(e.target.value)} className={inputClass}/></label><label className="text-xs font-semibold text-stone-400">Gender<select value={gender} onChange={e=>setGender(e.target.value)} className={inputClass}><option value="female">Female</option><option value="male">Male</option></select></label><label className="text-xs font-semibold text-stone-400">Weight<div className="flex"><input type="number" min="30" value={weight} onChange={e=>setWeight(e.target.value)} className={`${inputClass} min-w-0`}/><select value={unit} onChange={e=>setUnit(e.target.value)} className="mt-2 w-[76px] border border-l-0 border-white/15 bg-[#171b17] px-2 text-xs text-white outline-none"><option value="kg">kg</option><option value="lb">lb</option></select></div></label><label className="text-xs font-semibold text-stone-400">Height (cm)<input type="number" min="100" max="230" value={height} onChange={e=>setHeight(e.target.value)} className={inputClass}/></label></div><label className="mt-4 block text-xs font-semibold text-stone-400">Activity level<select value={activity} onChange={e=>setActivity(e.target.value)} className={inputClass}><option value="1.2">Mostly sitting · little exercise</option><option value="1.375">Light activity · 1–3 days/week</option><option value="1.55">Moderate · 3–5 days/week</option><option value="1.725">Very active · 6–7 days/week</option><option value="1.9">Highly active · physical job + training</option></select></label><div className="mt-5 flex gap-2">{['Lose fat','Maintain','Build muscle'].map(item=><button key={item} onClick={()=>setGoal(item)} className={`flex-1 border px-2 py-2.5 text-[11px] font-semibold ${goal===item?'border-cyan-400 bg-cyan-400/10 text-cyan-400':'border-white/10 text-stone-500 hover:text-white'}`}>{item}</button>)}</div></section><section><SectionLabel>Estimated daily targets</SectionLabel><div className="border-y border-white/10 py-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-stone-500">Daily calories</p><p className="mt-1 font-display text-5xl font-extrabold text-white">{calories.toLocaleString()}<span className="ml-2 text-sm font-medium text-stone-500">kcal</span></p></div><div className="text-right text-[10px] leading-5 text-stone-600">BMR {Math.round(bmr).toLocaleString()} kcal<br/>TDEE {tdee.toLocaleString()} kcal</div></div></div><div className="mt-5 space-y-5">{[{name:'Protein',value:protein,unit:'g',color:'bg-cyan-400',share:protein*4/calories},{name:'Carbohydrates',value:carbs,unit:'g',color:'bg-sky-400',share:carbs*4/calories},{name:'Fat',value:fat,unit:'g',color:'bg-orange-300',share:fat*9/calories}].map(macro=><div key={macro.name}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-stone-300">{macro.name}</span><span className="font-bold text-white">{macro.value}{macro.unit}<span className="ml-2 font-normal text-stone-600">{Math.round(macro.share*100)}%</span></span></div><div className="h-1.5 bg-white/10"><div className={`h-full ${macro.color}`} style={{width:`${Math.max(0,Math.min(100,macro.share*100))}%`}}/></div></div>)}</div><p className="mt-6 text-[10px] leading-5 text-stone-600">Estimate based on the Mifflin–St Jeor equation. Not medical advice; consult a qualified professional for individualized nutrition guidance.</p></section></div></div>
}

function Services() {
  const [billing,setBilling]=useState('Monthly')
  const plans=[{name:'1-on-1 Training',monthly:240,annual:216,tag:'IN PERSON',description:'Focused coaching with hands-on support and a plan built around your life.',features:['Weekly 1:1 sessions','Personalized strength plan','Form coaching + progress reviews'],icon:Dumbbell},{name:'Remote Coaching',monthly:149,annual:134,tag:'MOST FLEXIBLE',description:'Expert programming and real accountability, wherever you train.',features:['Custom training blocks','Weekly coach check-ins','Message support between sessions'],icon:Activity},{name:'Small Group Bootcamp',monthly:89,annual:80,tag:'TRAIN TOGETHER',description:'High-energy small-group sessions with the care of personal coaching.',features:['Three sessions each week','Groups capped at 8','All fitness levels welcome'],icon:Users}]
  return <div className="rise-in"><PageHeading eyebrow="Coaching, not quick fixes" title="Find your kind of support." description="Choose the structure that feels sustainable. Every option starts with a conversation, never pressure." action={<div className="flex border border-white/10 p-1">{['Monthly','Annual'].map(period=><button key={period} onClick={()=>setBilling(period)} className={`px-3 py-2 text-xs font-bold ${billing===period?'bg-cyan-400 text-zinc-950':'text-stone-500'}`}>{period}{period==='Annual'&&<span className="ml-1.5 text-[9px]">−10%</span>}</button>)}</div>}/><div className="grid gap-7 lg:grid-cols-3">{plans.map(({name,monthly,annual,tag,description,features,icon:Icon},index)=><article key={name} className={`flex flex-col border-t-2 pt-5 ${index===1?'border-cyan-400':'border-white/20'}`}><div className="flex items-center justify-between"><Icon size={20} className={index===1?'text-cyan-400':'text-stone-500'}/><span className="text-[9px] font-bold tracking-[.18em] text-stone-600">{tag}</span></div><h2 className="mt-6 font-display text-xl font-extrabold">{name}</h2><p className="mt-2 min-h-[52px] text-sm leading-6 text-stone-500">{description}</p><p className="mt-6 border-y border-white/10 py-4"><span className="font-display text-4xl font-extrabold">${billing==='Monthly'?monthly:annual}</span><span className="ml-1 text-xs text-stone-500">/ month</span></p><ul className="my-5 flex-1 space-y-3">{features.map(feature=><li key={feature} className="flex gap-2 text-xs text-stone-300"><Check size={14} className="shrink-0 text-cyan-400"/>{feature}</li>)}</ul><Link to="/app/booking" className={`flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${index===1?'bg-cyan-400 text-zinc-950 hover:bg-white':'border border-white/15 text-white hover:border-cyan-400 hover:text-cyan-400'}`}>Talk through options<ArrowRight size={15}/></Link></article>)}</div><div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-5"><p className="text-sm text-stone-400"><span className="font-semibold text-white">Not sure yet?</span> A 20-minute intro call is always complimentary.</p><Link to="/app/booking" className="text-xs font-bold text-cyan-400 hover:text-white">Book your intro <ArrowRight size={14} className="ml-1 inline"/></Link></div></div>
}

const promptData=[{category:'Training',title:'A quick home HIIT',prompt:'Create a 15-minute beginner-friendly HIIT workout I can do at home with no equipment. Include a warm-up, work/rest intervals, low-impact modifications, and a cooldown.'},{category:'Nutrition',title:'High-protein meal prep',prompt:'Create a practical 2,000 calorie high-protein meal prep plan for 5 weekdays. Include portions, approximate macros, a grocery list, budget-friendly swaps, and simple batch-cook instructions.'},{category:'Technique',title:'Review my squat',prompt:'Help me troubleshoot my squat technique. Ask me about my stance, depth, equipment, and where I feel discomfort before offering general cues. Do not diagnose injury; suggest a qualified coach or clinician if pain is involved.'},{category:'Recovery',title:'A gentle recovery day',prompt:'Suggest a 20-minute gentle recovery routine after strength training, with easy mobility, breathing, and a short walk option. Include modifications and tell me to stop if a movement causes pain.'}]
function PromptStudio() {
  const [category,setCategory]=useState('All'); const [copied,setCopied]=useState(''); const [query,setQuery]=useState('')
  const shown=promptData.filter(item=>(category==='All'||item.category===category)&&item.title.toLowerCase().includes(query.toLowerCase()))
  async function copyPrompt(item){try{await navigator.clipboard.writeText(item.prompt);setCopied(item.title);window.setTimeout(()=>setCopied(''),1800)}catch{setCopied('Clipboard unavailable')}}
  return <div className="rise-in"><PageHeading eyebrow="Better questions, better ideas" title="AI prompt studio." description="Use these as thoughtful starting points with your preferred AI assistant. Add your context and use your judgment."/><div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-4"><div className="flex flex-wrap gap-2">{['All','Training','Nutrition','Technique','Recovery'].map(item=><button key={item} onClick={()=>setCategory(item)} className={`px-3 py-2 text-xs font-semibold transition ${category===item?'bg-cyan-400 text-zinc-950':'border border-white/10 text-stone-500 hover:text-white'}`}>{item}</button>)}</div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search prompts…" className="w-full border-b border-white/15 bg-transparent px-1 py-2 text-xs outline-none focus:border-cyan-400 sm:w-48"/></div><div className="grid gap-x-9 md:grid-cols-2">{shown.map(item=><article key={item.title} className="border-b border-white/10 py-5"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.18em] text-cyan-400">{item.category}</span><button aria-label={`Copy ${item.title} prompt`} onClick={()=>copyPrompt(item)} className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 hover:text-white">{copied===item.title?<Check size={14} className="text-cyan-400"/>:<Copy size={13}/>} {copied===item.title?'Copied':'Copy prompt'}</button></div><h2 className="mt-3 font-display text-lg font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{item.prompt}</p></article>)}</div>{shown.length===0&&<p className="py-12 text-center text-sm text-stone-500">No prompts match that search.</p>}<p className="mt-6 flex items-start gap-2 text-[11px] leading-5 text-stone-600"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-cyan-400"/>Don't share sensitive health or personal information with third-party AI tools. AI output can be inaccurate; check advice with a qualified professional.</p></div>
}

const stories=[{name:'Sam, 34',goal:'Back to feeling capable',quote:'I stopped chasing an old version of myself and started building a routine that actually fits my life.',time:'8 months',image:'photo-1500648767791-00dcc994a43e',stat:'3 sessions / week'},{name:'Nia, 41',goal:'Stronger, on her terms',quote:'For the first time, the gym feels like a place I belong. That changed everything.',time:'6 months',image:'photo-1534528741775-53994a69daeb',stat:'Confidence first'},{name:'Chris, 29',goal:'Training without burnout',quote:'The plan flexes when work gets busy. I keep making progress instead of starting over.',time:'5 months',image:'photo-1506794778202-cad84cf45f1d',stat:'Built for real life'}]
function Stories() {
  return <div className="rise-in"><PageHeading eyebrow="Real people, real progress" title="Progress looks different on everyone." description="A few of the people who've made their own version of stronger. Shared with permission; individual results vary."/><div className="grid gap-8 md:grid-cols-3">{stories.map((story,index)=><article key={story.name} className="border-t border-white/15 pt-5"><div className="flex items-center gap-3"><img src={`https://images.unsplash.com/${story.image}?auto=format&fit=crop&w=160&h=160&q=80`} alt={story.name} className="h-12 w-12 rounded-full object-cover"/><div><p className="text-sm font-bold text-white">{story.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-cyan-400">{story.time} coaching</p></div><span className="ml-auto font-display text-3xl font-extrabold text-white/15">0{index+1}</span></div><h2 className="mt-6 font-display text-xl font-extrabold">{story.goal}</h2><p className="mt-3 min-h-[100px] text-sm leading-7 text-stone-400">“{story.quote}”</p><div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-stone-500"><CheckCircle2 size={14} className="text-cyan-400"/>{story.stat}</div></article>)}</div><div className="mt-10 border-y border-white/10 py-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-400">Your story starts here</p><p className="mt-2 text-sm text-stone-300">No before-and-after required. Just a next step.</p></div><Link to="/app/booking" className="inline-flex items-center gap-2 bg-cyan-400 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-zinc-950 hover:bg-white">Meet your coach<ArrowRight size={14}/></Link></div></div></div>
}

const articles=[{title:'The case for a boring workout plan',category:'Training',time:'6 min read',excerpt:'Why repeating the basics can take you further than chasing novelty.',body:'A great program does not need to surprise you every week. Repeating foundational movements gives you a fair way to notice progress: a little more control, another clean rep, or a load that feels manageable. Variety has its place, but consistency makes the signal easier to see. Pick a few movements you enjoy, make them fit your schedule, and give the plan enough time to work.'},{title:'Protein without the spreadsheet',category:'Nutrition',time:'4 min read',excerpt:'A simple, flexible way to make protein part of meals you already like.',body:'Start with the meal, not the math. Add a familiar protein source to meals you already enjoy: beans, tofu, eggs, yogurt, fish, poultry, or whatever fits your preferences. Spread it through the day if that feels good, and keep convenience options around for busy stretches. There is no single perfect meal plan, and a qualified dietitian can help when your needs are more specific.'},{title:'Rest days are part of the program',category:'Recovery',time:'5 min read',excerpt:'Recovery is not lost momentum. It is where training has room to land.',body:'Training gives your body a reason to adapt; recovery gives it the opportunity. A rest day can still include gentle movement if that feels restorative, but it does not need to become another performance target. Sleep, regular meals, and a little daylight are practical places to start. If fatigue or pain persists, seek advice from a healthcare professional.'},{title:'What progressive overload really means',category:'Training',time:'7 min read',excerpt:'Progress can be more than adding weight to the bar.',body:'Progressive overload is the gradual increase of a training challenge over time. Weight is one option, but so are additional reps, steadier technique, a larger range of motion, or more comfortable recovery between sets. Choose a small change you can repeat. If your form breaks down or pain appears, pause and get qualified guidance rather than forcing progression.'}]
function Guides() {
  const [category,setCategory]=useState('All');const [active,setActive]=useState(null)
  const categories=['All','Training','Nutrition','Recovery'];const filtered=articles.filter(article=>category==='All'||article.category===category)
  return <div className="rise-in"><PageHeading eyebrow="Field notes for your fitness life" title="The training journal." description="Evidence-aware guidance without the noise. Browse a topic and take what helps."/><div className="mb-5 flex gap-4 border-b border-white/10">{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={`border-b-2 px-1 pb-3 text-xs font-semibold ${category===item?'border-cyan-400 text-white':'border-transparent text-stone-500 hover:text-white'}`}>{item}</button>)}</div><div className="grid gap-x-10 md:grid-cols-2">{filtered.map((article,index)=><button key={article.title} onClick={()=>setActive(article)} className="group border-b border-white/10 py-6 text-left"><span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.18em] text-cyan-400"><span>{article.category}</span><span className="text-stone-600">{article.time}</span></span><h2 className="mt-4 max-w-lg font-display text-xl font-extrabold leading-7 text-white transition group-hover:text-cyan-400">{article.title}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{article.excerpt}</p><span className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-white">Read article<ArrowRight size={13}/></span><span className="sr-only">Article {index+1}</span></button>)}</div>{active&&<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={()=>setActive(null)}><article className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-white/15 bg-[#171b17] p-6 sm:p-9" onClick={event=>event.stopPropagation()}><div className="flex justify-between"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-400">{active.category} · {active.time}</span><button aria-label="Close article" onClick={()=>setActive(null)} className="text-stone-500 hover:text-white"><X size={19}/></button></div><h2 className="mt-5 font-display text-3xl font-extrabold">{active.title}</h2><p className="mt-5 border-l-2 border-cyan-400 pl-4 text-base leading-7 text-stone-300">{active.excerpt}</p><p className="mt-5 text-sm leading-7 text-stone-400">{active.body}</p><button onClick={()=>setActive(null)} className="mt-7 text-xs font-bold text-cyan-400 hover:text-white">Close article</button></article></div>}</div>
}

function Booking({ user }) {
  const [session,setSession]=useState('Virtual 1-on-1');const [date,setDate]=useState(0);const [slot,setSlot]=useState('');const [email,setEmail]=useState(user?.email||'');const [name,setName]=useState(user?.displayName||'');const [confirmed,setConfirmed]=useState(false)
  const [saving,setSaving]=useState(false);const [bookingError,setBookingError]=useState('')
  const days=Array.from({length:14},(_,index)=>{const day=new Date();day.setDate(day.getDate()+index+1);return day})
  const dateLabel=days[date]?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
  const slots=['9:00 AM','10:30 AM','12:00 PM','2:30 PM','4:00 PM']
  async function book(event){
    event.preventDefault()
    setBookingError('')
    if(!slot)return
    if(user?.uid==='demo-user'){
      setConfirmed(true)
      return
    }
    if(!user?.uid){
      setBookingError('Booking is unavailable. Sign in with a configured Geraldfit account and try again.')
      return
    }
    setSaving(true)
    const selectedDay=days[date]
    const appointmentDate=[selectedDay.getFullYear(),String(selectedDay.getMonth()+1).padStart(2,'0'),String(selectedDay.getDate()).padStart(2,'0')].join('-')
    try{
      const firestore=await getFirestoreDb()
      if(!firestore)throw new Error('Firebase is not configured.')
      const {addDoc,collection,serverTimestamp}=await import('firebase/firestore')
      await addDoc(collection(firestore,'bookings'),{
        uid:user.uid,
        name:name.trim(),
        email:email.trim(),
        sessionType:session,
        appointmentDate,
        appointmentTime:slot,
        status:'requested',
        createdAt:serverTimestamp(),
      })
      setConfirmed(true)
    }catch{
      setBookingError('We could not save your request. Please try again or contact Geraldfit directly.')
    }finally{
      setSaving(false)
    }
  }
  if(confirmed)return <div className="mx-auto max-w-2xl py-12 text-center rise-in"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cyan-400 text-zinc-950"><Check size={28}/></span><p className="mt-7 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-400">{user?.uid==='demo-user'?'Demo preview':'Request saved'}</p><h1 className="mt-3 font-display text-4xl font-extrabold">Let's get you moving.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-400">{user?.uid==='demo-user'?'This preview was not saved or sent.':<>Your request was saved for review and is not a confirmed appointment. The trainer will need to contact you at <span className="font-semibold text-white">{email}</span>.</>}</p><div className="mx-auto mt-8 max-w-md border-y border-white/10 py-4 text-left text-xs text-stone-500"><p className="flex justify-between py-1"><span>Session</span><span className="text-white">{session}</span></p><p className="flex justify-between py-1"><span>Name</span><span className="text-white">{name}</span></p></div><button onClick={()=>{setConfirmed(false);setSlot('')}} className="mt-7 text-xs font-bold text-cyan-400 hover:text-white">Book another session</button></div>
  return <div className="rise-in"><PageHeading eyebrow="The first step is a conversation" title="Let's find a time." description="Pick a session, date, and time that work for you. This saves a request for review; it is not a confirmed appointment."/><form onSubmit={book} className="grid gap-10 xl:grid-cols-[1fr_.8fr]">{bookingError && <p role="alert" className="border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200 xl:col-span-2">{bookingError}</p>}<section><SectionLabel>Choose your session</SectionLabel><div className="grid gap-2 sm:grid-cols-3">{[{title:'In-person',detail:'At the Geraldfit studio',icon:Dumbbell},{title:'Virtual 1-on-1',detail:'Video call, wherever you are',icon:Users},{title:'Nutrition review',detail:'A 30-minute check-in',icon:Heart}].map(({title,detail,icon:Icon})=><button type="button" key={title} onClick={()=>setSession(title)} className={`border p-4 text-left transition ${session===title?'border-cyan-400 bg-cyan-400/[.06]':'border-white/10 hover:border-white/25'}`}><Icon size={18} className={session===title?'text-cyan-400':'text-stone-500'}/><p className="mt-4 text-xs font-bold text-white">{title}</p><p className="mt-1 text-[10px] text-stone-500">{detail}</p></button>)}</div><div className="mt-8"><SectionLabel>Pick a day</SectionLabel><div className="flex items-center gap-2"><button type="button" aria-label="Previous dates" onClick={()=>setDate(Math.max(0,date-1))} className="grid h-8 w-8 shrink-0 place-items-center border border-white/10 text-stone-500 hover:text-white"><ChevronLeft size={16}/></button><div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-7">{days.slice(Math.floor(date/7)*7,Math.floor(date/7)*7+7).map(day=>{const index=days.indexOf(day);return <button type="button" key={day.toISOString()} onClick={()=>setDate(index)} className={`border py-2.5 text-center ${date===index?'border-cyan-400 bg-cyan-400 text-zinc-950':'border-white/10 text-stone-400 hover:border-white/35'}`}><span className="block text-[9px] font-bold uppercase">{day.toLocaleDateString('en-US',{weekday:'short'})}</span><span className="mt-1 block font-display text-lg font-extrabold">{day.getDate()}</span></button>})}</div><button type="button" aria-label="Next dates" onClick={()=>setDate(Math.min(13,date+1))} className="grid h-8 w-8 shrink-0 place-items-center border border-white/10 text-stone-500 hover:text-white"><ChevronRight size={16}/></button></div></div><div className="mt-8"><SectionLabel>Available times <span className="font-normal normal-case tracking-normal text-stone-600">· {dateLabel}</span></SectionLabel><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map(time=><button type="button" key={time} onClick={()=>setSlot(time)} className={`border px-2 py-2.5 text-xs font-semibold ${slot===time?'border-cyan-400 bg-cyan-400 text-zinc-950':'border-white/10 text-stone-400 hover:border-white/35 hover:text-white'}`}>{time}</button>)}</div></div></section><section className="border-t border-white/15 pt-5"><SectionLabel>Your details</SectionLabel><label className="mb-4 block text-xs font-semibold text-stone-400">Name<input required value={name} onChange={e=>setName(e.target.value)} className={inputClass} placeholder="Your name"/></label><label className="mb-5 block text-xs font-semibold text-stone-400">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className={inputClass} placeholder="you@example.com"/></label><div className="border-y border-white/10 py-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">Request summary</p><p className="flex justify-between py-1.5 text-xs"><span className="text-stone-500">Session</span><span className="text-white">{session}</span></p><p className="flex justify-between py-1.5 text-xs"><span className="text-stone-500">Date</span><span className="text-white">{dateLabel}</span></p><p className="flex justify-between py-1.5 text-xs"><span className="text-stone-500">Time</span><span className="text-white">{slot||'Choose a time'}</span></p></div><button disabled={!slot||saving} className="mt-5 flex w-full items-center justify-between bg-cyan-400 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? 'Saving request...' : 'Submit booking request'}<ArrowRight size={15}/></button><p className="mt-3 text-[10px] leading-5 text-stone-600">No payment needed. The trainer must review and confirm your request.</p></section></form></div>
}

function App() {
  return <AuthProvider><Routes><Route path="/" element={<AuthPortal/>}/><Route path="/app/*" element={<ProtectedRoute><AppShell/></ProtectedRoute>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AuthProvider>
}

export default App