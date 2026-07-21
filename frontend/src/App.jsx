import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingAuth from './pages/LandingAuth';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hire_me_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hire_me_token');
    localStorage.removeItem('hire_me_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                !user ? (
                  <LandingAuth onLoginSuccess={(u) => setUser(u)} />
                ) : user.role === 'PROVIDER' ? (
                  <Navigate to="/provider-dashboard" replace />
                ) : (
                  <Navigate to="/client-dashboard" replace />
                )
              }
            />

            <Route
              path="/client-dashboard"
              element={
                user && user.role === 'CLIENT' ? (
                  <ClientDashboard user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/provider-dashboard"
              element={
                user && user.role === 'PROVIDER' ? (
                  <ProviderDashboard user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
