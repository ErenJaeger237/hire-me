import React from 'react';
import { Star, CheckCircle2, ShieldCheck, MapPin, X, Calendar, DollarSign } from 'lucide-react';

export default function ProviderProfileModal({ provider, isOpen, onClose, onBookNow }) {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-bright w-full max-w-2xl rounded-2xl shadow-xl border border-outline overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Cover Photo / Header background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white transition-colors rounded-full backdrop-blur-md"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start relative -mt-12">
            
            {/* Avatar with Verified Badge */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-surface-bright shadow-md bg-surface-container flex-shrink-0">
                {provider.profilePicture ? (
                  <img src={provider.profilePicture} alt={provider.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold text-4xl bg-primary/10">
                    {provider.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-surface-bright rounded-full p-1 shadow-sm" title="Verified Professional">
                <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-100" />
              </div>
            </div>

            {/* Name and Basic Details */}
            <div className="pt-14 md:pt-16 flex-1 w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface flex items-center gap-2">
                    {provider.name}
                    <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified" />
                  </h1>
                  <p className="text-primary font-medium text-lg mt-0.5">{provider.trade}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-on-surface">{provider.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-on-surface-variant text-sm">
                    ({provider.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats & Bio */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">About</h3>
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                  {provider.bio || 'Experienced local professional available for direct hire. Dedicated to high-quality results, punctuality, and excellent customer service.'}
                </p>
              </section>
              
              <section>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface">{provider.trade}</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface">Reliable</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface">Verified</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full text-sm text-on-surface">Top Rated</span>
                </div>
              </section>
            </div>

            {/* Sidebar / Booking CTA */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline h-fit">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-on-surface">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Hourly Rate</p>
                    <p className="font-bold text-lg">{provider.hourlyRate} FCFA</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-on-surface">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Location</p>
                    <p className="font-medium">{(Math.random() * 10 + 1).toFixed(1)} km away</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-on-surface">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Availability</p>
                    <p className="font-medium text-emerald-600">Available Now</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline">
                <button
                  onClick={() => {
                    onClose();
                    onBookNow(provider);
                  }}
                  className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-base hover:bg-opacity-90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Request Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
