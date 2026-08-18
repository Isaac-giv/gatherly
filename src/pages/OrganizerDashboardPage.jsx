import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { CreateEventModal } from '../components/CreateEventModal';
import { DollarSign, Ticket, Users, CheckCircle2, Plus, Download, Sparkles, UserCheck, Flame, ArrowUpRight, Clock } from 'lucide-react';

export const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'waitlist', 'sales'
  const [promotedLog, setPromotedLog] = useState(null);

  useEffect(() => {
    fetchDashboard();

    if (socket) {
      socket.on('ticket_purchased', () => fetchDashboard());
      socket.on('ticket_checked_in', () => fetchDashboard());
      socket.on('waitlist_promoted', () => fetchDashboard());

      return () => {
        socket.off('ticket_purchased');
        socket.off('ticket_checked_in');
        socket.off('waitlist_promoted');
      };
    }
  }, [socket]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/dashboard?organizerId=${user.id}`);
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePromoteWaitlist = async (waitlistId) => {
    try {
      const res = await fetch('/api/analytics/promote-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId })
      });
      const data = await res.json();
      if (data.success) {
        setPromotedLog(`Promoted ${data.waitlist.userName}! Invitation email notification issued.`);
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/analytics/export-csv', '_blank');
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-400 text-sm">Loading Live Organizer Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Real-time Organizer Suite
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">Organizer Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor revenue, live WebSocket sales feeds, attendance conversion, and waitlists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Export CSV Roster
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl glow-button text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Promoted Alert Banner */}
      {promotedLog && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{promotedLog}</span>
          <button onClick={() => setPromotedLog(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-slate-900/80 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Gross Revenue</span>
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-3xl text-white">${analytics.totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Stripe Connect Payout Verified
          </p>
        </div>

        {/* Total Tickets Sold */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Tickets Issued</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-3xl text-white">{analytics.totalTicketsSold}</p>
          <p className="text-[11px] text-slate-400">Out of {analytics.totalCapacity} total capacity</p>
        </div>

        {/* Check-in Conversion Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Attendance Rate</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-3xl text-emerald-400">{analytics.overallAttendanceRate}%</p>
          <p className="text-[11px] text-slate-400">Scanned door check-in conversion</p>
        </div>

        {/* Active Events */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Events</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-black text-3xl text-white">{analytics.totalEvents}</p>
          <p className="text-[11px] text-slate-400">Published live on feed</p>
        </div>

      </div>

      {/* Main Section: Events & Waitlist Tabs */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Managed Events ({analytics.eventMetrics.length})
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'waitlist' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Waitlist Promotions
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Sales Feed (Sockets)
            </button>
          </div>
        </div>

        {/* TAB 1: Events Overview Table */}
        {activeTab === 'events' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Event Title</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Tickets Sold</th>
                  <th className="p-4">Check-in Rate</th>
                  <th className="p-4">Waitlist Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics.eventMetrics.map(evt => (
                  <tr key={evt.eventId} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white">{evt.title}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">${evt.revenue.toLocaleString()}</td>
                    <td className="p-4">{evt.soldCount} / {evt.capacity}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {evt.conversionRate}%
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-amber-400">{evt.waitlistCount} waiting</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Waitlist Promotion Manager */}
        {activeTab === 'waitlist' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              When ticket spots clear up or capacity expands, promote waitlisted attendees with 1-click.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Marcus Chen</h4>
                <p className="text-xs text-slate-400">marcus@devs.io • Neon Horizon: AI & Web3 Summit (Early Bird Pass)</p>
              </div>

              <button
                onClick={() => handlePromoteWaitlist('wait_01')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Promote & Issue Pass
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Recent Sales Feed */}
        {activeTab === 'sales' && (
          <div className="space-y-3">
            {analytics.recentSales.map(tkt => (
              <div key={tkt._id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{tkt.userName}</span>
                    <span className="text-slate-400 ml-2">purchased {tkt.ticketTierName}</span>
                    <p className="text-[10px] text-indigo-400 mt-0.5">{tkt.eventTitle}</p>
                  </div>
                </div>
                <span className="font-mono text-slate-400">{new Date(tkt.purchasedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Event Wizard Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          setIsCreateModalOpen(false);
          fetchDashboard();
        }}
      />

    </div>
  );
};
