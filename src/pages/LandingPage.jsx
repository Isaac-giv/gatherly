import React, { useState } from 'react';
import { Calendar, Ticket, BarChart3, Zap, QrCode, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';
import logo from '/logo.jpg';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Create & Manage Events',
    description: 'Set up events in minutes. Define ticket tiers, set capacity, add venue details and publish to thousands of attendees.',
    color: 'from-indigo-500 to-purple-500',
    glow: 'shadow-indigo-500/20'
  },
  {
    icon: Ticket,
    title: 'Buy & Sell Tickets',
    description: 'Seamless checkout with cryptographically signed QR tickets. Waitlist management for sold-out events.',
    color: 'from-violet-500 to-pink-500',
    glow: 'shadow-violet-500/20'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live sales dashboards, revenue tracking, attendance rates and audience insights — all in real-time.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20'
  },
  {
    icon: QrCode,
    title: 'QR Scanner Check-in',
    description: 'Instant ticket validation with the built-in QR scanner app. No extra hardware or apps needed.',
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20'
  },
  {
    icon: Zap,
    title: 'Real-Time Notifications',
    description: 'Live ticket sale toasts, viewer counts, and instant updates powered by WebSockets.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/20'
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Separate Organizer and Attendee experiences. Each role gets a tailored interface.',
    color: 'from-rose-500 to-red-500',
    glow: 'shadow-rose-500/20'
  }
];

const STATS = [
  { value: '10K+', label: 'Events Hosted' },
  { value: '500K+', label: 'Tickets Issued' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'User Rating' }
];

export const LandingPage = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-400/30 shadow-lg shadow-indigo-500/20">
              <img src={logo} alt="Gatherly" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
              Gatherly
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
              TICKETING PLATFORM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onSignup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 border border-indigo-500/40"
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold mb-8 backdrop-blur">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Full-Stack Event Management Platform · Now Live
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
            Unforgettable Events,
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
            Simplified.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The complete platform to create, manage and sell tickets for any event.
          Real-time analytics, QR check-in, and a seamless attendee experience — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onSignup}
            className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-indigo-600/40 border border-indigo-500/50 text-base"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold rounded-2xl transition-all border border-slate-700 text-base backdrop-blur"
          >
            Sign In to Your Account
          </button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <div className="flex -space-x-2">
            {['1534528741775-53994a69daeb','1494790108377-be9c29b29330','1507003211169-0a1dd7228f2d','1517841905240-472988babdf9'].map((id, i) => (
              <img
                key={i}
                src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=40&q=80`}
                className="w-7 h-7 rounded-full border-2 border-[#0b0f19] object-cover"
                alt="user"
              />
            ))}
          </div>
          <span>Join <strong className="text-slate-300">10,000+</strong> event organizers & attendees</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center backdrop-blur">
              <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                {value}
              </div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything you need to run a{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              great event
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From creation to check-in, Gatherly handles every step of the event lifecycle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, glow }) => (
            <div
              key={title}
              className={`group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 backdrop-blur transition-all hover:shadow-xl ${glow}`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${color} mb-4 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900/60 border border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 mb-4 text-indigo-300 text-sm font-semibold">
              <Star className="w-4 h-4 fill-indigo-400 text-indigo-400" />
              Free to get started. No credit card required.
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to host your first event?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Create your organizer account in seconds and publish your first event today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onSignup}
                className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/40 border border-indigo-500/50 text-base"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLogin}
                className="px-8 py-4 text-slate-300 hover:text-white font-semibold text-base transition-colors"
              >
                Already have an account? Sign in →
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img src={logo} alt="Gatherly" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white text-sm">Gatherly</span>
            <span className="text-slate-500 text-xs">· Event Management & Ticketing Platform</span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 Gatherly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
