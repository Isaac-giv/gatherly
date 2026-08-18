import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Sparkles, Ticket, X } from 'lucide-react';

export const SalesTickerToast = () => {
  const { recentSalesNotification, setRecentSalesNotification } = useSocket();

  useEffect(() => {
    if (recentSalesNotification) {
      const timer = setTimeout(() => {
        setRecentSalesNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentSalesNotification, setRecentSalesNotification]);

  if (!recentSalesNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all duration-300">
      <div className="glass-panel bg-slate-900/90 border border-indigo-500/50 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 max-w-sm flex items-start gap-3 backdrop-blur-md">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl flex-shrink-0 border border-indigo-500/30">
          <Ticket className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Live Ticket Purchase
            </span>
            <button 
              onClick={() => setRecentSalesNotification(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-100 truncate mt-0.5">
            {recentSalesNotification.buyerName} just bought a ticket!
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            <span className="text-emerald-400 font-medium">{recentSalesNotification.tierName}</span> • {recentSalesNotification.eventTitle}
          </p>
        </div>
      </div>
    </div>
  );
};
