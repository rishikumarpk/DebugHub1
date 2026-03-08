import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Dashboard } from './pages/Dashboard';

import { Community } from './pages/Community';
import { Portfolio } from './pages/Portfolio';
import { Login } from './pages/Login';
import Layout from './components/layout/Layout';
import { DebugRoom } from './pages/DebugRoom';
import { DebugReplay } from './pages/DebugReplay';
import { useAuthStore } from './store/useAuthStore';
import { API_URL } from './config';
import DailyChallengesTracker from './pages/DailyChallengesTracker';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Practice from './pages/Practice';
import Incidents from './pages/Incidents';
import Simulator from './pages/simulator/Simulator';
import KnightCapital from './pages/incidents/KnightCapital';

export default function App() {
  const { user, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    // Capture token from URL if present (from Google redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const authToken = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-emerald-500">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="daily-bug" element={<DailyChallengesTracker />} />
          <Route path="challenges" element={<DailyChallengesTracker />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Portfolio />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="practice" element={<Practice />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/knight-capital" element={<KnightCapital />} />
          <Route path="simulator/:scenarioId" element={<Simulator />} />
          <Route path="room/:id" element={<DebugRoom />} />
          <Route path="replay/:id" element={<DebugReplay />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
