import React, { useState } from 'react';
import { X, Briefcase, DollarSign, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { userService } from '../services/api';

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }) {
  const [step, setStep] = useState(1);
  const [trade, setTrade] = useState('');
  const [hourlyRate, setHourlyRate] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const trades = ['Plumber', 'Electrician', 'Tutor', 'Cleaner', 'Web Developer', 'Mechanic', 'Carpenter', 'Painter'];

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!trade || !hourlyRate) {
      setError('Please select a trade and hourly rate.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await userService.upgradeToProvider(trade, hourlyRate);
      setStep(3); // Success step
      setTimeout(() => {
        onUpgradeSuccess(res);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upgrade to professional.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl border border-outline relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline bg-surface-bright">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Become a Professional
          </h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-error/10 text-error text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">What is your expertise?</h3>
                <p className="text-sm text-on-surface-variant mb-4">Select the primary service you will offer to clients.</p>
                <div className="grid grid-cols-2 gap-3">
                  {trades.map(t => (
                    <button
                      key={t}
                      onClick={() => setTrade(t)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        trade === t 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-outline hover:border-primary/50 text-on-surface-variant'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!trade}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Set your hourly rate</h3>
                <p className="text-sm text-on-surface-variant mb-4">You can always change this later in your profile settings.</p>
                
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="1000"
                    step="500"
                    className="w-full pl-10 py-3 bg-surface-container rounded-xl border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface font-medium"
                    placeholder="e.g. 5000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant font-medium">FCFA / hr</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-outline text-on-surface font-medium hover:bg-surface-container transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={loading || !hourlyRate}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Upgrade'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Congratulations!</h3>
              <p className="text-on-surface-variant">Your account has been upgraded to a Professional.</p>
              <p className="text-sm text-primary font-medium animate-pulse mt-4">Redirecting to your new dashboard...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
