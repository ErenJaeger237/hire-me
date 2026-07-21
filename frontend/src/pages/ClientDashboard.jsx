import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { providerService, bookingService } from '../services/api';
import BookingModal from '../components/BookingModal';

export default function ClientDashboard({ user }) {
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Filters
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);

  // Modal State
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchProviders = async () => {
    try {
      const data = await providerService.getProviders({ category, maxPrice });
      setProviders(data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProviders(), fetchBookings()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, maxPrice]);

  const handleOpenBooking = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setFeedbackMsg('Your booking request was submitted successfully!');
    fetchBookings();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40">
        <div>
          <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-1">Client Portal</div>
          <h2 className="text-3xl font-extrabold text-white">Find Skilled Professionals Near You</h2>
          <p className="text-slate-400 text-sm mt-1">Book verified day-to-day professionals at transparent hourly rates.</p>
        </div>

        <button
          onClick={() => {
            fetchProviders();
            fetchBookings();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Discovery & Search Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" /> Professional Discovery
          </h3>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by trade (e.g. Tutor)..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Max: ${maxPrice}/hr</span>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Provider Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading service professionals...</div>
        ) : providers.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 border border-slate-800">
            No service providers match your current search criteria. Try adjusting the trade filter or max rate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div
                key={p.id}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/20">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {p.rating.toFixed(1)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white">{p.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mt-1">
                      {p.trade}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                    {p.bio || 'Experienced local professional available for direct hire.'}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Hourly Rate</span>
                    <span className="text-xl font-extrabold text-white">${p.hourlyRate}</span>
                    <span className="text-xs text-slate-400">/hr</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(p)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Active Bookings Section */}
      <div className="space-y-6 pt-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" /> My Booking History
        </h3>

        {bookings.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-500 border border-slate-800 text-sm">
            You haven't requested any jobs yet. Select a professional above to create your first booking.
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Provider</th>
                    <th className="px-6 py-3.5">Service Date</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {b.provider?.user?.name || 'Professional'}
                        <span className="block text-[11px] font-normal text-indigo-400">{b.provider?.trade}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {new Date(b.job_date).toLocaleDateString()} {new Date(b.job_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-400">
                        {b.description || 'No description provided.'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-block border ${
                            b.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : b.status === 'ACCEPTED'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : b.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <BookingModal
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
