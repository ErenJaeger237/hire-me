import React, { useState } from 'react';
import { Wallet, Phone, CheckCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function WalletModal({ isOpen, onClose, currentBalance, onTopUpSuccess }) {
  const [amount, setAmount] = useState('5000');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('MTN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTopUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (parseInt(amount) < 100) {
      setError('Minimum top-up is 100 FCFA');
      return;
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length !== 9 || !cleanPhone.startsWith('6')) {
      setError('Please enter a valid 9-digit Cameroonian number starting with 6');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('hire_me_token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_BASE_URL}/wallet/topup`, {
        amount: parseInt(amount),
        provider
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onTopUpSuccess(res.data.balance);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process Mobile Money top-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-bright rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-outline relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Wallet Top-Up</h2>
              <p className="text-sm text-on-surface-variant font-medium">Current Balance: <span className="text-emerald-600 font-bold">{currentBalance} FCFA</span></p>
            </div>
          </div>

          <form onSubmit={handleTopUp} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Select Network</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('MTN')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    provider === 'MTN' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' : 'border-outline text-on-surface-variant hover:border-yellow-200'
                  }`}
                >
                  MTN Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('ORANGE')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    provider === 'ORANGE' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-outline text-on-surface-variant hover:border-orange-200'
                  }`}
                >
                  Orange Money
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Mobile Money Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="tel"
                  placeholder="6XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-outline pl-12 pr-4 py-3.5 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Amount (FCFA)</label>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface border border-outline px-4 py-3.5 rounded-xl text-lg font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-error bg-error/10 p-3 rounded-lg border border-error/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Confirm Top-Up</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
