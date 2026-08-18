import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Calendar, Ticket, LayoutDashboard, QrCode, Sparkles, User, RefreshCw } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, switchPersona } = useAuth();
  const { isConnected } = useSocket();

  const handleRoleToggle = () => {
    const nextRole = user.role === 'ORGANIZER' ? 'ATTENDEE' : 'ORGANIZER';
    switchPersona(nextRole);
    if (nextRole === 'ORGANIZER' && activeTab === 'tickets') {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                Gatherly
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                TICKETING PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" /> Discover
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Ticket className="w-4 h-4" /> My Tickets
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Organizer Hub
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <QrCode className="w-4 h-4" /> Scanner App
            </button>
          </nav>

          {/* Right Action Bar & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Socket Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isConnected ? 'Real-Time Live' : 'Connecting'}</span>
            </div>

            {/* Role / Persona Switcher */}
            <button
              onClick={handleRoleToggle}
              title="Click to switch persona role"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-all shadow-sm"
            >
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-indigo-400/40" />
              <div className="text-left hidden sm:block">
                <p className="font-semibold leading-tight text-white">{user.name}</p>
                <p className="text-[10px] text-indigo-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> {user.role} VIEW
                </p>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/90 py-2 px-2">
        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'feed' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <Calendar className="w-4 h-4" /> Discover
        </button>
        <button onClick={() => setActiveTab('tickets')} className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'tickets' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <Ticket className="w-4 h-4" /> Vault
        </button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-4 h-4" /> Organizer
        </button>
        <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center gap-1 text-[11px] ${activeTab === 'scanner' ? 'text-indigo-400' : 'text-slate-400'}`}>
          <QrCode className="w-4 h-4" /> Scan
        </button>
      </div>
    </header>
  );
};
