import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingAuth from './pages/LandingAuth';
import ClientDashboard from './pages/ClientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleUserUpdate = (updatedUserProps) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedUserProps };
      localStorage.setItem('hire_me_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onUserUpdate={handleUserUpdate} />}>
          <Route
            path="/"
            element={
              !user ? (
                <LandingAuth onLoginSuccess={(u) => setUser(u)} />
              ) : user.role === 'ADMIN' ? (
                <Navigate to="/admin-dashboard" replace />
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
          <Route
            path="/admin-dashboard"
            element={
              user && user.role === 'ADMIN' ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
