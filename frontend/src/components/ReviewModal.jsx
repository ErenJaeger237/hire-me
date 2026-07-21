import React, { useState } from 'react';
import { bookingService } from '../services/api';

export default function ReviewModal({ booking, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const providerName = booking.provider?.user?.name || 'Professional';
  const providerTrade = booking.provider?.trade || 'Service Provider';

  const feedbackMessages = [
    "Select a rating",
    "Disappointing - Needs improvement",
    "Below average - Could be better",
    "Good - Met expectations",
    "Great - Highly recommend",
    "Excellent - Exceeded expectations"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await bookingService.submitReview(booking.id, {
        rating,
        review: reviewText,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-bright w-full max-w-lg rounded-xl shadow-sm border border-outline overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
        
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-1 hover:bg-surface-container transition-colors rounded-full text-on-surface-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header/Hero Section */}
        <div className="p-8 bg-primary-container text-on-primary-container flex flex-col items-center text-center gap-4 relative">
          <div className="w-20 h-20 rounded-full border-4 border-on-primary-container/20 shadow-lg overflow-hidden bg-surface-container flex items-center justify-center text-3xl font-bold text-on-surface">
            {providerName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Rate your experience with {providerName}</h1>
            <p className="text-sm opacity-90 font-medium">Job completed on {new Date(booking.job_date).toLocaleDateString()} • {providerTrade}</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          
          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-error">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating System */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Overall Quality</span>
            <div className="flex gap-2 text-outline-variant">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`material-symbols-outlined text-5xl transition-colors duration-200 hover:scale-110 ${
                    rating >= star ? 'text-warning' : 'text-outline-variant'
                  }`}
                  style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </button>
              ))}
            </div>
            <p className="text-base font-medium text-primary h-6 italic">
              {feedbackMessages[rating]}
            </p>
          </div>

          {/* Review Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface block" htmlFor="review-text">
              Share more about your experience (optional)
            </label>
            <textarea
              id="review-text"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did they do well? Was the task completed on time?"
              className="w-full p-4 bg-surface border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base outline-none transition-all resize-none"
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-secondary text-on-secondary rounded-lg font-bold text-lg hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
            <span className="material-symbols-outlined">{loading ? 'sync' : 'send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
