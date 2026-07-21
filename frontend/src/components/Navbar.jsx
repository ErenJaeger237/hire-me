import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, FileText, UserCheck, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <nav className="glass-card sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              Hire<span className="gradient-text">Me</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block -mt-1">
              On-Demand Services
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* API Docs link removed as per user request */}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="text-[11px] font-medium text-blue-600 flex items-center justify-end gap-1">
                  {user.role === 'PROVIDER' ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Professional Provider
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Client
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
