import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Award, Calendar, DollarSign, RefreshCw, AlertCircle, MessageSquare, Star, Loader2, BarChart2 } from 'lucide-react';
import { bookingService, userService, providerService } from '../services/api';
import ChatModal from '../components/ChatModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProviderDashboard({ user, onUserUpdate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  
  // Chat State
  const [selectedBookingToChat, setSelectedBookingToChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('jobs');
  const [earnings, setEarnings] = useState(null);

  const fetchProviderBookings = async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await bookingService.getBookings();
      setBookings(data.bookings || data);
      
      const earningsData = await providerService.getEarnings();
      setEarnings(earningsData);
      
      if (onUserUpdate) {
        userService.getProfile().then(profile => {
          onUserUpdate({ wallet_balance: profile.user.wallet_balance });
        }).catch(err => console.error(err));
      }
    } catch (err) {
      console.error('Failed to fetch provider dashboard data:', err);
      setActionError('Could not load dashboard data.');
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

  const chartData = [
    { name: 'Pending', count: pendingJobs.length, color: '#f59e0b' },
    { name: 'Active', count: activeJobs.length, color: '#0ea5e9' },
    { name: 'Completed', count: completedJobs.length, color: '#10b981' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-8 border border-outline flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-surface-bright">
        <div>
          <div className="text-xs uppercase font-bold text-primary tracking-wider mb-1">Provider Workbench</div>
          <h2 className="text-3xl font-extrabold text-on-surface">Welcome back, {user.name}</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage incoming job requests, accept bookings, and view your analytics.</p>
        </div>

        <button
          onClick={fetchProviderBookings}
          className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-2 border border-outline transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Jobs
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4" /> {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-outline">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Job Board
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'earnings' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Earnings
        </button>
      </div>

      {activeTab === 'jobs' && (
        <>
          {/* Analytics Chart */}
      <div className="glass-card rounded-3xl p-6 border border-outline shadow-sm bg-surface-bright">
        <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" /> Job Status Analytics
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--color-outline-variant)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-outline-variant)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{fill: 'var(--color-surface-container)'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-outline)', backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
      </div>
      </>
      )}

      {activeTab === 'earnings' && earnings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-outline bg-surface-bright flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Earnings</h3>
              <p className="text-3xl font-extrabold text-on-surface">{earnings.totalEarnings.toLocaleString()} FCFA</p>
            </div>
            
            <div className="glass-card rounded-3xl p-6 border border-outline bg-surface-bright flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pending Escrow</h3>
              <p className="text-3xl font-extrabold text-on-surface">{earnings.pendingEscrow.toLocaleString()} FCFA</p>
              <p className="text-xs text-on-surface-variant mt-2">Locked in active jobs (5% fee applied)</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-outline bg-surface-bright flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Completed Jobs</h3>
              <p className="text-3xl font-extrabold text-on-surface">{earnings.completedJobs}</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-outline bg-surface-bright shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4">Recent Transactions</h3>
            {earnings.recentTransactions.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">No transactions yet.</p>
            ) : (
              <div className="divide-y divide-outline">
                {earnings.recentTransactions.map(tx => (
                  <div key={tx.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{tx.type.replace('_', ' ')}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-on-surface'}`}>
                      {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()} FCFA
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ChatModal
        booking={selectedBookingToChat}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
