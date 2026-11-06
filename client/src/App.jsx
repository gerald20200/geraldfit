import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import WorkoutPage from './pages/WorkoutPage.jsx';

export default function App() {
  return <Routes><Route path="/" element={<LandingPage />} /><Route path="/auth" element={<AuthPage />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/workout/:id" element={<WorkoutPage />} /></Route><Route path="*" element={<LandingPage />} /></Routes>;
}