import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, QrCode, Download, ShieldCheck, CheckCircle2, Clock, Sparkles, AlertCircle } from 'lucide-react';

export const TicketVaultPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);

  useEffect(() => {
    fetchMyTickets();
  }, [user]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/my-tickets?userId=${user.id}`);
      const data = await res.json();
      setTickets(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Generate and Download ICS Calendar File for Apple / Google Calendar
  const downloadIcsCalendar = (ticket) => {
    const title = ticket.eventTitle;
    const description = `Gatherly Ticket Pass: ${ticket.ticketTierName}. Show QR Hash ${ticket.qrCodeHash} at entry scanner.`;
    const startDateStr = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDateStr = new Date(Date.now() + 7200000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gatherly Ticketing Platform//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
DTSTART:${startDateStr}
DTEND:${endDateStr}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `gatherly_event_${ticket._id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cryptographic Digital Vault
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">My Digital Tickets</h1>
          <p className="text-slate-400 text-xs mt-1">
            Access your signed QR passes for upcoming events and check-in validation.
          </p>
        </div>

        <button
          onClick={fetchMyTickets}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl flex items-center gap-2 self-start sm:self-auto"
        >
          Refresh Vault
        </button>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-48 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Tickets in Vault Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            You haven't reserved any event passes yet. Discover upcoming tech, music, and food events on the discovery feed!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map(ticket => (
            <div 
              key={ticket._id}
              className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all"
            >
              
              {/* Ticket Meta Details */}
              <div className="space-y-4 flex-1">
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    {ticket.ticketTierName}
                  </span>

                  {ticket.isCheckedIn ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CHECKED IN
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> READY FOR SCAN
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-white group-hover:text-indigo-300 transition-colors">
                    {ticket.eventTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Attendee: <strong className="text-slate-200">{ticket.userName}</strong> ({ticket.userEmail})</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/80 inline-flex">
                  <span className="text-indigo-400 font-bold">HASH:</span>
                  <span>{ticket.qrCodeHash}</span>
                </div>

                {/* Calendar & Receipt Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => downloadIcsCalendar(ticket)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Add to Calendar (.ics)
                  </button>
                </div>

              </div>

              {/* QR Code Canvas Box */}
              <div 
                onClick={() => setSelectedTicketModal(ticket)}
                className="bg-white p-4 rounded-2xl border-4 border-indigo-600 shadow-2xl cursor-pointer hover:scale-105 transition-transform flex flex-col items-center gap-2 group/qr"
              >
                <img src={ticket.qrCodeDataUrl} alt="Ticket QR Code" className="w-36 h-36 object-contain" />
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-indigo-600" /> Click to enlarge
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal for Enlarged QR Code Scanning */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-indigo-500/40 bg-slate-900 text-center space-y-4 relative">
            <button 
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            <h3 className="font-display font-bold text-lg text-white">{selectedTicketModal.eventTitle}</h3>
            <p className="text-xs text-indigo-400 font-semibold">{selectedTicketModal.ticketTierName}</p>

            <div className="bg-white p-6 rounded-2xl border-4 border-indigo-600 inline-block">
              <img src={selectedTicketModal.qrCodeDataUrl} alt="QR Code" className="w-56 h-56 mx-auto object-contain" />
            </div>

            <p className="font-mono text-xs font-bold text-indigo-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
              HASH: {selectedTicketModal.qrCodeHash}
            </p>

            <p className="text-[11px] text-slate-400">
              Present this screen at the organizer entry door for camera QR scanning.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
