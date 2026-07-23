import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, Clock, AlertCircle, BarChart3, Briefcase } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('hire_me_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, providersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/analytics`, getHeaders()),
        axios.get(`${API_BASE_URL}/admin/users`, getHeaders()),
        axios.get(`${API_BASE_URL}/admin/providers`, getHeaders())
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users);
      setProviders(providersRes.data.providers);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyProvider = async (id, isVerified) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/providers/${id}/verify`, { is_verified: isVerified }, getHeaders());
      fetchDashboardData();
    } catch (err) {
      console.error('Error verifying provider:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-on-surface-variant flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-surface">
      <div className="bg-surface-container border-b border-outline">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" /> Admin Control Center
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm">Manage platform metrics, user access, and verifications.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center gap-6 mt-4">
          {['overview', 'financials', 'users', 'providers'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
        
        {activeTab === 'overview' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col col-span-1 md:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                <Users className="w-5 h-5" />
                <span className="font-medium">Total Users</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-2">{analytics.totalUsers}</p>
              <p className="text-sm text-primary font-medium">{analytics.totalClients} Clients | {analytics.totalProviders} Providers</p>
            </div>
            
            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col">
              <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Total Bookings</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-2">{analytics.totalBookings}</p>
              <p className="text-sm text-on-surface-variant">All time platform jobs</p>
            </div>

            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col">
              <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed Jobs</span>
              </div>
              <p className="text-4xl font-bold text-on-surface mb-2">{analytics.completedBookings}</p>
              <p className="text-sm text-emerald-600 font-medium bg-emerald-100 w-fit px-2 py-0.5 rounded">Success Rate {(analytics.completedBookings / Math.max(analytics.totalBookings, 1) * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}

        {activeTab === 'financials' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col">
              <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Current Escrow Holdings</span>
              </div>
              <p className="text-4xl font-bold text-amber-600 mb-2">{analytics.currentEscrow} <span className="text-lg">FCFA</span></p>
              <p className="text-sm text-on-surface-variant">Locked in active jobs</p>
            </div>

            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col">
              <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Total Processed Volume</span>
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">{analytics.totalProcessedVolume} <span className="text-lg">FCFA</span></p>
              <p className="text-sm text-on-surface-variant">Money paid to providers</p>
            </div>

            <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Total Clients', value: analytics?.totalClients || 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Total Providers', value: analytics?.totalProviders || 0, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-on-surface">{stat.value}</div>
                  <div className="text-sm font-medium text-on-surface-variant">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                   <BarChart3 className="w-5 h-5 text-emerald-600" />
                 </div>
                 <h3 className="font-semibold text-on-surface">Platform Revenue</h3>
               </div>
               <div className="text-3xl font-bold text-on-surface">{analytics?.platformRevenue?.toLocaleString() || 0} FCFA</div>
               <p className="text-sm text-on-surface-variant mt-2 font-medium">Total 5% commissions collected</p>
             </div>
             
             <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                   <Briefcase className="w-5 h-5 text-amber-600" />
                 </div>
                 <h3 className="font-semibold text-on-surface">Current Escrow</h3>
               </div>
               <div className="text-3xl font-bold text-on-surface">{analytics?.currentEscrow?.toLocaleString() || 0} FCFA</div>
               <p className="text-sm text-on-surface-variant mt-2 font-medium">Funds held for active jobs</p>
             </div>
             
             <div className="bg-surface-bright p-6 rounded-2xl border border-outline shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                   <CheckCircle className="w-5 h-5 text-blue-600" />
                 </div>
                 <h3 className="font-semibold text-on-surface">Total Processed</h3>
               </div>
               <div className="text-3xl font-bold text-on-surface">{analytics?.totalProcessedVolume?.toLocaleString() || 0} FCFA</div>
               <p className="text-sm text-on-surface-variant mt-2 font-medium">All-time payout volume</p>
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-surface-bright rounded-2xl border border-outline shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider font-medium border-b border-outline text-xs">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Wallet Balance</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline text-on-surface">
                  {users.map(u => (
                    <tr key={u.id} className={`transition-colors ${u.is_banned ? 'bg-red-50/50' : 'hover:bg-surface-container'}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-base flex items-center gap-2">
                          {u.name}
                          {u.is_banned && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Banned</span>}
                        </div>
                        <div className="text-on-surface-variant text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 
                          u.role === 'PROVIDER' ? 'bg-amber-100 text-amber-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {u.wallet_balance || 0} FCFA
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={async () => {
                            const amount = prompt('Enter amount to add/deduct (e.g., 5000 or -2000):');
                            if (!amount) return;
                            const val = parseFloat(amount);
                            const type = val >= 0 ? 'credit' : 'debit';
                            try {
                              await axios.patch(`${API_BASE_URL}/admin/users/${u.id}/wallet`, { amount: Math.abs(val), type }, getHeaders());
                              fetchDashboardData();
                            } catch (err) { alert(err.response?.data?.error || err.message); }
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-surface-container border border-outline rounded-lg hover:bg-outline"
                        >
                          Wallet ±
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={async () => {
                              try {
                                await axios.patch(`${API_BASE_URL}/admin/users/${u.id}/ban`, { is_banned: !u.is_banned }, getHeaders());
                                fetchDashboardData();
                              } catch (err) { alert(err.message); }
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                              u.is_banned ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {u.is_banned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-surface-bright rounded-2xl border border-outline shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider font-medium border-b border-outline text-xs">
                  <tr>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Trade & Rate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline text-on-surface">
                  {providers.map(p => (
                    <tr key={p.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-base">{p.name}</div>
                        <div className="text-on-surface-variant text-xs">{p.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{p.profile?.trade}</div>
                        <div className="text-on-surface-variant text-xs">{p.profile?.hourly_rate} FCFA/hr</div>
                        {p.profile?.verification_doc_url && (
                          <a href={p.profile.verification_doc_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs mt-1 block">
                            View Document
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {p.profile?.is_verified ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full w-fit">
                            <AlertCircle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleVerifyProvider(p.id, !p.profile?.is_verified)}
                          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                            p.profile?.is_verified 
                              ? 'bg-surface-container text-on-surface-variant hover:bg-rose-100 hover:text-rose-700 border border-outline' 
                              : 'bg-primary text-white hover:opacity-90 shadow-sm'
                          }`}
                        >
                          {p.profile?.is_verified ? 'Revoke' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="bg-surface-bright rounded-2xl border border-outline overflow-hidden">
            {!disputes || disputes.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
                <p>No active disputes.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-outline">
                  <tr>
                    <th className="p-4 font-medium text-on-surface-variant">Booking ID</th>
                    <th className="p-4 font-medium text-on-surface-variant">Provider</th>
                    <th className="p-4 font-medium text-on-surface-variant">Date</th>
                    <th className="p-4 font-medium text-on-surface-variant text-right">Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map(d => (
                    <tr key={d.id} className="border-b border-outline last:border-0 hover:bg-surface transition-colors">
                      <td className="p-4 font-medium text-on-surface">#{d.id}</td>
                      <td className="p-4 text-on-surface-variant">{d.provider?.user?.name || 'Unknown Provider'}</td>
                      <td className="p-4 text-on-surface-variant">{new Date(d.job_date).toLocaleDateString()}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await axios.patch(`${API_BASE_URL}/bookings/${d.id}`, { status: 'REJECTED' }, getHeaders());
                              fetchDashboardData();
                            } catch (err) { alert(err.message); }
                          }}
                          className="px-4 py-1.5 rounded-full text-sm font-medium border border-error text-error hover:bg-error/10 transition-colors"
                        >
                          Refund Client
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await axios.patch(`${API_BASE_URL}/bookings/${d.id}`, { status: 'COMPLETED' }, getHeaders());
                              fetchDashboardData();
                            } catch (err) { alert(err.message); }
                          }}
                          className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                        >
                          Pay Provider
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
