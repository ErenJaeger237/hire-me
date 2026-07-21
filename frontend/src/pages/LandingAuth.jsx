import React, { useState } from 'react';
import { Briefcase, UserCheck, Wrench, ShieldCheck, ArrowRight, Star, Sparkles } from 'lucide-react';
import { authService } from '../services/api';

export default function LandingAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CLIENT');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [trade, setTrade] = useState('Math Tutor');
  const [hourlyRate, setHourlyRate] = useState(35);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login({ email, password });
        localStorage.setItem('hire_me_token', data.token);
        localStorage.setItem('hire_me_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        const payload = { name, email, password, role };
        if (role === 'PROVIDER') {
          payload.trade = trade;
          payload.hourlyRate = parseFloat(hourlyRate);
          payload.bio = bio;
        }
        const data = await authService.register(payload);
        localStorage.setItem('hire_me_token', data.token);
        localStorage.setItem('hire_me_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoRole) => {
    if (demoRole === 'CLIENT') {
      setEmail('client@example.com');
      setPassword('password123');
      setIsLogin(true);
    } else {
      setEmail('marcus@example.com');
      setPassword('password123');
      setIsLogin(true);
    }
  };

  const inputClasses = "w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const labelClasses = "block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            The #1 Local Services Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Find Trusted Local Professionals <span className="text-blue-600">in Seconds.</span>
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            Connect directly with verified tutors, plumbers, and technicians without agency fees. Search, book, and pay securely in one place.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                <UserCheck className="w-4 h-4" /> 100% Direct Contact
              </div>
              <p className="text-xs text-slate-500">No hidden middleman fees. You talk directly with the professional you hire.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Verified Local Experts
              </div>
              <p className="text-xs text-slate-500">Every professional is vetted and reviewed by real members of your community.</p>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Quick Demo Login:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('CLIENT')}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all"
              >
                Demo Client
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('PROVIDER')}
                className="px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-all"
              >
                Demo Provider
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative">
            {/* Toggle Header */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isLogin ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`w-1/2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  !isLogin ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className={labelClasses}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Register As</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('CLIENT')}
                        className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          role === 'CLIENT'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" /> Client (Seeker)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('PROVIDER')}
                        className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          role === 'PROVIDER'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Wrench className="w-4 h-4" /> Professional
                      </button>
                    </div>
                  </div>

                  {role === 'PROVIDER' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Electrician"
                            value={trade}
                            onChange={(e) => setTrade(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate (FCFA)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
                        <textarea
                          rows={2}
                          placeholder="Highlight your trade skills..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className={labelClasses}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label className={labelClasses}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClasses}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {loading ? 'Processing...' : isLogin ? 'Access Portal' : 'Register Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
