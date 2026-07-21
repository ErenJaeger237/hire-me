import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Award, Calendar, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/api';

export default function ProviderDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const fetchProviderBookings = async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch provider bookings:', err);
      setActionError('Could not load incoming job requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionError('');
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      fetchProviderBookings();
    } catch (err) {
      setActionError(err.response?.data?.error || `Failed to update status to ${newStatus}.`);
    }
  };

  const pendingJobs = bookings.filter((b) => b.status === 'PENDING');
  const activeJobs = bookings.filter((b) => b.status === 'ACCEPTED');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40">
        <div>
          <div className="text-xs uppercase font-bold text-purple-400 tracking-wider mb-1">Provider Workbench</div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back, {user.name}</h2>
          <p className="text-slate-400 text-sm mt-1">Manage incoming job requests, accept bookings, and complete assignments.</p>
        </div>

        <button
          onClick={fetchProviderBookings}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Jobs
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {actionError}
        </div>
      )}

      {/* Kanban Job Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending Requests */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Requests
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {pendingJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {pendingJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No pending job requests.</p>
            ) : (
              pendingJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.client?.name || 'Client Request'}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      📅 {new Date(b.job_date).toLocaleDateString()} at {new Date(b.job_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 italic">
                    "{b.description || 'No description provided.'}"
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                      className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                      className="w-1/2 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Active Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" /> Active Jobs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
              {activeJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {activeJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active accepted jobs.</p>
            ) : (
              activeJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.client?.name || 'Client'}</h4>
                    <p className="text-xs text-sky-400 mt-0.5 font-mono">
                      📅 {new Date(b.job_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {b.description || 'In progress job.'}
                  </p>
                  <button
                    onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                    className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" /> Mark Job Completed
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Completed Jobs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {completedJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {completedJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No completed jobs yet.</p>
            ) : (
              completedJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 opacity-90">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{b.client?.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Finished
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{b.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
