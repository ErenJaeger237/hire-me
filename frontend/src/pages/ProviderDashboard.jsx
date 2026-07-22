import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Award, Calendar, DollarSign, RefreshCw, AlertCircle, MessageSquare, Star, Loader2 } from 'lucide-react';
import { bookingService } from '../services/api';
import ChatModal from '../components/ChatModal';

export default function ProviderDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  
  // Chat State
  const [selectedBookingToChat, setSelectedBookingToChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const fetchProviderBookings = async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await bookingService.getBookings();
      setBookings(data.bookings || data);
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

  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [cardErrors, setCardErrors] = useState({});

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setLoadingBookingId(bookingId);
    setCardErrors((prev) => ({ ...prev, [bookingId]: '' }));
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      fetchProviderBookings();
    } catch (err) {
      setCardErrors((prev) => ({
        ...prev,
        [bookingId]: err.response?.data?.error || `Failed to ${newStatus.toLowerCase()} booking.`,
      }));
    } finally {
      setLoadingBookingId(null);
    }
  };

  const pendingJobs = bookings.filter((b) => b.status === 'PENDING');
  const activeJobs = bookings.filter((b) => b.status === 'ACCEPTED');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-purple-50 via-white to-indigo-50">
        <div>
          <div className="text-xs uppercase font-bold text-purple-600 tracking-wider mb-1">Provider Workbench</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Welcome back, {user.name}</h2>
          <p className="text-slate-600 text-sm mt-1">Manage incoming job requests, accept bookings, and complete assignments.</p>
        </div>

        <button
          onClick={fetchProviderBookings}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Jobs
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4" /> {actionError}
        </div>
      )}

      {/* Kanban Job Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending Requests */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col space-y-4 bg-white/50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Pending Requests
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
              {pendingJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {pendingJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No pending job requests.</p>
            ) : (
              pendingJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.client?.name || 'Client Request'}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      📅 {new Date(b.job_date).toLocaleDateString()} at {new Date(b.job_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    "{b.description || 'No description provided.'}"
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedBookingToChat(b); setIsChatModalOpen(true); }}
                      className="flex-1 py-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 font-bold text-xs transition-colors flex items-center justify-center"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                      disabled={loadingBookingId === b.id}
                      className={`flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 ${loadingBookingId === b.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loadingBookingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {loadingBookingId === b.id ? '...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                      disabled={loadingBookingId === b.id}
                      className={`flex-1 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 ${loadingBookingId === b.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                  {cardErrors[b.id] && (
                    <p className="text-xs text-rose-600 font-medium">{cardErrors[b.id]}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Active Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col space-y-4 bg-white/50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" /> Active Jobs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 text-xs font-bold border border-sky-200">
              {activeJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {activeJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active accepted jobs.</p>
            ) : (
              activeJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden">
                        {b.client?.profile_picture_url ? (
                          <img src={b.client.profile_picture_url} alt={b.client?.name} className="w-full h-full object-cover" />
                        ) : (
                          (b.client?.name || 'C').charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{b.client?.name || 'Client'}</h4>
                        <p className="text-xs text-sky-600 mt-0.5 font-mono">
                          📅 {new Date(b.job_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedBookingToChat(b); setIsChatModalOpen(true); }}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                      title="Chat with client"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {b.description || 'In progress job.'}
                  </p>
                  {b.status === 'ACCEPTED' && (
                    <div className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Waiting for Client to Mark Completed
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col space-y-4 bg-white/50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> Completed Jobs
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
              {completedJobs.length}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {completedJobs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No completed jobs yet.</p>
            ) : (
              completedJobs.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden">
                        {b.client?.profile_picture_url ? (
                          <img src={b.client.profile_picture_url} alt={b.client?.name} className="w-full h-full object-cover" />
                        ) : (
                          (b.client?.name || 'C').charAt(0)
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{b.client?.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedBookingToChat(b); setIsChatModalOpen(true); }}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View Chat History"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        Finished
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                  
                  {b.rating && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> 
                        {b.rating} / 5
                      </div>
                      {b.review_text && (
                        <p className="text-xs text-slate-600 italic">"{b.review_text}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ChatModal
        booking={selectedBookingToChat}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
