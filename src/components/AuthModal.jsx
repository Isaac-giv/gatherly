import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Sparkles, Eye, EyeOff, Zap, User, Mail, Lock, ArrowRight, Loader } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    label: 'Organizer Demo',
    description: 'Create events, view analytics, scan tickets',
    email: 'organizer@gatherly.io',
    password: 'password123',
    role: 'ORGANIZER',
    icon: '🎤',
    color: 'from-violet-600 to-indigo-600',
    badge: 'ORGANIZER'
  },
  {
    label: 'Attendee Demo',
    description: 'Browse events, buy tickets, view vault',
    email: 'sarah@attendee.com',
    password: 'password123',
    role: 'ATTENDEE',
    icon: '🎟️',
    color: 'from-emerald-600 to-teal-600',
    badge: 'ATTENDEE'
  }
];

export const AuthModal = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ATTENDEE' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) throw new Error('Name is required');
        await register(form.name, form.email, form.password, form.role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account, idx) => {
    setDemoLoading(idx);
    setError('');
    try {
      await login(account.email, account.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a12]/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 border border-indigo-400/30 mb-4">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Gatherly</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Full-stack event management & ticketing platform</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur">
          {/* Demo Quick-Login Cards */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Quick Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((account, idx) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoLogin(account, idx)}
                  disabled={demoLoading !== null}
                  className={`relative flex flex-col gap-1.5 p-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 transition-all text-left group disabled:opacity-60`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{account.icon}</span>
                    {demoLoading === idx
                      ? <Loader className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      : <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    }
                  </div>
                  <p className="text-white text-sm font-semibold">{account.label}</p>
                  <p className="text-slate-400 text-[11px] leading-tight">{account.description}</p>
                  <span className={`mt-0.5 self-start px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r ${account.color} text-white`}>
                    {account.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500">or sign in with your account</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 mb-5 border border-slate-700">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {tab === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                {['ATTENDEE', 'ORGANIZER'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      form.role === role
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {role === 'ATTENDEE' ? '🎟️ Attendee' : '🎤 Organizer'}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm mt-1"
            >
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> {tab === 'login' ? 'Signing in...' : 'Creating account...'}</>
                : <><Sparkles className="w-4 h-4" /> {tab === 'login' ? 'Sign In' : 'Create Account'}</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Gatherly · Full-Stack Event Management Platform
        </p>
      </div>
    </div>
  );
};
