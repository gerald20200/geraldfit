import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="screen-loader" aria-label="Checking admin access"><span /></div>;
  return user?.isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}