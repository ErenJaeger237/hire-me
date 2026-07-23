import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, Mail, Calendar, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import BookingModal from '../components/BookingModal';

export default function ProviderPublicProfile({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const token = localStorage.getItem('hire_me_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE_URL}/providers/${id}`, { headers });
        setProvider(res.data);
      } catch (err) {
        console.error(err);
        setError('Could not load provider profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-surface gap-4">
        <div className="text-error font-bold">{error || 'Provider not found'}</div>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-surface">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
        
        <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>

        {/* Hero Section */}
        <div className="glass-card rounded-3xl overflow-hidden border border-outline shadow-sm bg-surface-bright">
          <div className="h-32 bg-gradient-to-r from-primary to-emerald-500 opacity-90"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
              <div className="w-32 h-32 rounded-2xl bg-surface-container-highest border-4 border-surface-bright flex items-center justify-center text-4xl text-on-surface font-bold shadow-md overflow-hidden bg-white">
                {provider.profilePicture ? (
                  <img src={provider.profilePicture} alt={provider.name} className="w-full h-full object-cover" />
                ) : (
                  provider.name.charAt(0)
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-on-surface">{provider.name}</h1>
                  {provider.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full" title="Verified Professional">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-on-surface-variant font-medium">
                  <div className="flex items-center gap-1 text-primary"><Briefcase className="w-4 h-4" /> {provider.trade}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {provider.locationText || 'Remote'}</div>
                  <div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {provider.rating} / 5.0</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <div className="text-sm text-on-surface-variant font-medium">Hourly Rate</div>
                  <div className="text-3xl font-black text-on-surface">{provider.hourlyRate} <span className="text-base text-on-surface-variant font-medium">FCFA</span></div>
                </div>
                {user?.role !== 'PROVIDER' && user?.role !== 'ADMIN' && (
                  <button 
                    onClick={() => {
                      if (!user) return navigate('/login');
                      setIsBookingModalOpen(true);
                    }}
                    className="w-full bg-primary text-on-primary font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity shadow-md"
                  >
                    Hire {provider.name.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            <div className="glass-card rounded-3xl p-8 border border-outline shadow-sm bg-surface-bright">
              <h2 className="text-xl font-bold text-on-surface mb-4">About Me</h2>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {provider.bio || `Hi! I'm ${provider.name}, a professional ${provider.trade}. I'm dedicated to providing high-quality service and ensuring my clients are completely satisfied.`}
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-outline shadow-sm bg-surface-bright">
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Client Reviews ({provider.reviews?.length || 0})
              </h2>
              
              <div className="space-y-6">
                {!provider.reviews || provider.reviews.length === 0 ? (
                  <p className="text-on-surface-variant italic">No reviews yet. Be the first to hire and review {provider.name.split(' ')[0]}!</p>
                ) : (
                  provider.reviews.map(review => (
                    <div key={review.id} className="border-b border-outline last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface text-sm overflow-hidden">
                            {review.clientAvatar ? <img src={review.clientAvatar} alt="avatar" /> : review.clientName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-sm">{review.clientName}</div>
                            <div className="text-xs text-on-surface-variant">{new Date(review.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-500' : 'text-outline-variant'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed ml-13 pl-13">{review.comment || 'No comment provided.'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-outline shadow-sm bg-surface-bright">
              <h3 className="font-bold text-on-surface mb-4">Professional Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary"><Calendar className="w-4 h-4" /></div>
                  <div>
                    <div className="font-medium text-on-surface">Joined</div>
                    <div>{provider.joinedAt ? new Date(provider.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
                  <div>
                    <div className="font-medium text-on-surface">Jobs Completed</div>
                    <div>{provider.reviews?.length || 0} via Hire Me</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {isBookingModalOpen && (
        <BookingModal 
          provider={provider} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}
    </div>
  );
}
