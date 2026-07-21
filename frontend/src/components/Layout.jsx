import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileSettings from './ProfileSettings';

export default function Layout({ user, onLogout, isSettingsOpen, setIsSettingsOpen, onUserUpdate }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onUserUpdate={onUserUpdate}
      />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      {isSettingsOpen && user && (
        <ProfileSettings currentUser={user} onClose={() => setIsSettingsOpen(false)} onUserUpdate={onUserUpdate} />
      )}
    </div>
  );
}
