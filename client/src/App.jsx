import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import WorkoutPage from './pages/WorkoutPage.jsx';

export default function App() {
  return <><Routes><Route path="/" element={<LandingPage />} /><Route path="/auth" element={<AuthPage />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/workout/:id" element={<WorkoutPage />} /><Route element={<AdminRoute />}><Route path="/admin" element={<AdminPage />} /></Route></Route><Route path="*" element={<LandingPage />} /></Routes><WhatsAppButton /></>;
}