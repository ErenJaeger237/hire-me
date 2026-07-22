import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { bookingService } from '../services/api';

export default function BookingModal({ provider, isOpen, onClose, onSuccess }) {
  const [jobDate, setJobDate] = useState('');
  const [jobTime, setJobTime] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!jobDate || !jobTime) {
      setError('Please select both a date and time.');
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledDateTime = new Date(`${jobDate}T${jobTime}:00Z`).toISOString();
      
      await bookingService.createBooking({
        providerId: provider.id,
        date: scheduledDateTime,
        description,
      });

      setSuccessMessage('Booking request submitted successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
        setJobDate('');
        setJobTime('');
        setDescription('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = ['09:00', '13:00', '16:00', '19:00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-bright w-full max-w-lg rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline animate-in fade-in zoom-in duration-300">
        
        <header className="flex items-center justify-between px-8 py-4 border-b border-outline">
          <h2 className="text-2xl font-bold text-on-surface">Schedule Booking with {provider.name}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-1 hover:bg-surface-container transition-colors rounded-full">
            <X className="w-6 h-6 text-on-surface-variant" />
          </button>
        </header>

        {successMessage ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Requested!</h3>
            <p className="text-slate-600">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
            <div className="px-8 py-8 space-y-6 overflow-y-auto">
              
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant block">Select Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={jobDate}
                    onChange={(e) => setJobDate(e.target.value)}
                    className="w-full h-12 bg-surface-bright border border-outline rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant block">Available Time Slots</label>
                <div className="flex flex-wrap gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setJobTime(time)}
                      className={`px-4 py-2 border rounded-full text-sm font-medium transition-all duration-200 ${
                        jobTime === time 
                          ? 'border-primary bg-primary text-white shadow-sm' 
                          : 'border-outline text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant block" htmlFor="task-desc">Detailed Task Description</label>
                <textarea
                  id="task-desc"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the specific work needed, any tools required, and entry instructions..."
                  className="w-full bg-surface-bright border border-outline rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base resize-none"
                ></textarea>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-2">
                <div className="flex justify-between items-center text-base">
                  <span className="text-on-surface-variant">Rate</span>
                  <span className="font-medium">{provider.hourlyRate} FCFA / hr</span>
                </div>
                <div className="flex justify-between items-center text-base">
                  <span className="text-on-surface-variant">Estimated Duration</span>
                  <span className="font-medium">2 Hours</span>
                </div>
                <div className="pt-3 mt-3 border-t border-outline-variant flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-wider text-on-surface">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary">{provider.hourlyRate * 2} FCFA</span>
                </div>
              </div>

            </div>

            <footer className="px-8 py-4 bg-surface-container-lowest border-t border-outline flex items-center justify-end gap-4 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit Booking'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
