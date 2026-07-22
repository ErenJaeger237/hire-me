import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, RefreshCw, ChevronDown, CheckCircle2, UserCheck } from 'lucide-react';
import { providerService, bookingService } from '../services/api';
import BookingModal from '../components/BookingModal';
import ChatModal from '../components/ChatModal';
import ReviewModal from '../components/ReviewModal';
import ProviderProfileModal from '../components/ProviderProfileModal';

export default function ClientDashboard({ user }) {
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Filters
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('distance');

  // Modal State
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingToChat, setSelectedBookingToChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProviderForProfile, setSelectedProviderForProfile] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const fetchProviders = async () => {
    try {
      const lat = user?.location_lat;
      const lng = user?.location_lng;
      const data = await providerService.getProviders({ category, maxPrice, lat, lng });
      
      let fetchedProviders = data.providers || data;
      
      // Client-side sorting
      fetchedProviders.sort((a, b) => {
        if (sortBy === 'price_asc') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'price_desc') return b.hourlyRate - a.hourlyRate;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: distance
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      setProviders([...fetchedProviders]);
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      fetchBookings();
      setFeedbackMsg(`Job successfully marked as ${newStatus}!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || `Failed to update booking.`);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
  }, []); // Only fetch bookings once on mount

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, maxPrice, sortBy]); // Fetch providers initially and whenever filters change

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
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Search Banner matching Stitch */}
      <section className="pt-12 pb-16 bg-surface-container w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-on-surface">Find the perfect expert for your task</h1>
          
          <div className="bg-surface-bright rounded-xl p-2 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto shadow-sm border border-outline">
            <div className="flex-1 w-full flex items-center px-4 border-r-0 md:border-r border-outline">
              <Search className="w-5 h-5 text-on-surface-variant mr-3" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant outline-none"
              />
            </div>
            
            <div className="w-full md:w-64 px-4 flex items-center border-r-0 md:border-r border-outline">
              <DollarSign className="w-5 h-5 text-on-surface-variant mr-2" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-on-surface-variant font-medium">Max: {maxPrice} FCFA/hr</span>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-primary"
                />
              </div>
            </div>
            
            <button 
              onClick={fetchProviders}
              className="w-full md:w-auto bg-primary text-on-primary px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              Search
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Plumbing', 'Electrical', 'Cleaning', 'Development'].map(tag => (
              <span 
                key={tag}
                onClick={() => setCategory(tag)}
                className="text-xs font-medium text-on-surface-variant px-4 py-1.5 bg-surface-container-high rounded-full hover:bg-outline-variant cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {feedbackMsg && (
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content: Provider Grid */}
      <main className="flex-grow bg-surface py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Top Recommended Professionals</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
              Sort by: 
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-primary cursor-pointer focus:ring-0 font-bold"
              >
                <option value="distance">Distance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating: Highest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-surface-bright rounded-2xl p-6 border border-outline animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-surface-container" />
                      <div className="space-y-2 pt-2">
                        <div className="h-4 bg-surface-container rounded w-24" />
                        <div className="h-3 bg-surface-container rounded w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="h-3 bg-surface-container rounded mb-2 w-3/4" />
                  <div className="h-3 bg-surface-container rounded w-1/2 mb-6" />
                  <div className="h-10 bg-surface-container rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-surface-bright rounded-xl p-8 text-center text-on-surface-variant border border-outline">
              No service providers match your current search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-surface-bright rounded-2xl p-6 border border-outline hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full"
                  onClick={() => { setSelectedProviderForProfile(p); setIsProfileModalOpen(true); }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface-container">
                        {p.profilePicture ? (
                          <img src={p.profilePicture} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-outline" title="Verified">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-medium border border-primary/20">
                        {p.trade}
                      </span>
                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="text-sm font-bold text-on-surface">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-primary font-bold text-base mb-3">{p.hourlyRate} FCFA <span className="text-xs font-normal text-on-surface-variant">/hr</span></p>
                  
                  <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">
                    {p.bio || 'Experienced local professional available for direct hire. Dedicated to high-quality results.'}
                  </p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenBooking(p); }}
                      className="w-full py-2.5 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* My Bookings Section in Stitch UI format */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-on-surface mb-6 border-t border-outline pt-12">My Booking History</h2>
            
            {bookings.length === 0 ? (
              <div className="bg-surface-bright rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-outline border-dashed shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-extrabold text-on-surface mb-2">You haven't hired anyone yet!</h3>
                <p className="text-on-surface-variant max-w-sm mb-6">When you book a professional, their details and progress will appear here. Start by browsing our top-rated local experts.</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                >
                  Browse Professionals
                </button>
              </div>
            ) : (
              <div className="bg-surface-bright rounded-xl border border-outline overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider font-medium border-b border-outline text-xs">
                      <tr>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Service Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline text-on-surface">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-container transition-colors">
                          <td className="px-6 py-4 font-semibold">
                            {b.provider?.user?.name || 'Professional'}
                            <span className="block text-xs font-normal text-primary mt-0.5">{b.provider?.trade}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium">{new Date(b.job_date).toLocaleDateString()}</span>
                            <span className="block text-xs text-on-surface-variant mt-0.5">{new Date(b.job_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-on-surface-variant">
                            {b.description || 'No description.'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${
                                b.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                                b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                b.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {b.status}
                              </span>
                              <button
                                onClick={() => { setSelectedBookingToChat(b); setIsChatModalOpen(true); }}
                                className="text-xs font-bold bg-surface-container-high text-on-surface border border-outline hover:bg-outline transition-colors px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                              >
                                Open Chat
                              </button>
                              {b.status === 'ACCEPTED' && (
                                <button
                                  onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                                  disabled={updatingBookingId === b.id}
                                  className={`text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${updatingBookingId === b.id ? 'opacity-70' : ''}`}
                                >
                                  {updatingBookingId === b.id ? '...' : <><CheckCircle className="w-3.5 h-3.5" /> Mark Completed</>}
                                </button>
                              )}
                              {b.status === 'COMPLETED' && b.rating === null && (
                                <button
                                  onClick={() => { setSelectedBookingForReview(b); setIsReviewModalOpen(true); }}
                                  className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                                >
                                  <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                                  Leave Review
                                </button>
                              )}
                              {b.rating !== null && (
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {b.rating} / 5
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <BookingModal
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <ChatModal
        booking={selectedBookingToChat}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={user}
      />

      <ProviderProfileModal
        provider={selectedProviderForProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onBookNow={handleOpenBooking}
      />
      
      <ReviewModal
        booking={selectedBookingForReview}
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); fetchBookings(); fetchProviders(); }}
        onSuccess={() => { /* no-op for now, until toast is added */ }}
      />
    </div>
  );
}
