import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('geraldfit_token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/users/profile');
        setUser(data.user);
      } catch {
        const refreshToken = localStorage.getItem('geraldfit_refresh_token');
        if (!refreshToken) { logout(); setLoading(false); return; }
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          saveSession(data);
        } catch { logout(); }
      } finally { setLoading(false); }
    }
    restoreSession();
  }, []);

  function saveSession(data) {
    localStorage.setItem('geraldfit_token', data.token);
    localStorage.setItem('geraldfit_refresh_token', data.refreshToken);
    setUser(data.user);
  }

  async function authenticate(endpoint, payload) {
    const { data } = await api.post(`/auth/${endpoint}`, payload);
    if (data.token) {
      saveSession(data);
      try { return await refreshUser(); } catch { return data.user; }
    }
    return data.user;
  }

  async function refreshUser() {
    const { data } = await api.get('/users/profile');
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('geraldfit_token');
    localStorage.removeItem('geraldfit_refresh_token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login: (payload) => authenticate('login', payload), register: (payload) => authenticate('register', payload), logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}