import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { Calendar, MapPin, Tag, Users, Flame, ShieldCheck, Ticket, ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

export const EventDetailPage = ({ eventId, onBack, onCheckoutSuccess }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(6);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  useEffect(() => {
    fetchEvent();

    if (socket && eventId) {
      socket.emit('join_event_room', eventId);

      socket.on('viewer_count_updated', (data) => {
        if (data.eventId === eventId) {
          setViewerCount(data.viewerCount);
        }
      });

      return () => {
        socket.emit('leave_event_room', eventId);
        socket.off('viewer_count_updated');
      };
    }
  }, [eventId, socket]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      setEvent(data);
      if (data.ticketTiers && data.ticketTiers.length > 0) {
        setSelectedTier(data.ticketTiers[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleWaitlist = async (tierId) => {
    try {
      const res = await fetch('/api/orders/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          ticketTierId: tierId
        })
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistSuccess(true);
        fetchEvent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-400 text-sm">Loading Gathering Details...</p>
      </div>
    );
  }

  const startDateFormatted = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const startTimeFormatted = new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      {/* Banner & Header Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="relative h-80 sm:h-96 w-full">
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        {/* Live Viewer Counter (FOMO Badge) */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg animate-pulse">
          <Flame className="w-4 h-4 text-rose-500" />
          <span>{viewerCount} people viewing right now</span>
        </div>

        {/* Header Details */}
        <div className="relative z-10 p-8 sm:p-10 -mt-20 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold">
              {event.category}
            </span>
            <span className="text-xs text-slate-400">Organized by <strong className="text-white">{event.organizerName}</strong></span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{startDateFormatted} at {startTimeFormatted}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{event.venueName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Ticket Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Description & Venue Location Map */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Description Card */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 bg-slate-900/50">
            <h3 className="font-display font-bold text-xl text-white">About This Event</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-light">
              {event.description}
            </p>
          </div>

          {/* Venue & Location Map */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 bg-slate-900/50">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> Venue & Map Location
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-white">{event.venueName}</p>
              <p className="text-slate-400 text-xs">{event.venueAddress}</p>
            </div>

            {/* Interactive Google Map Preview Frame */}
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
              <iframe
                title="Venue Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venueAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
              />
            </div>
          </div>

        </div>

        {/* Right Column: Ticket Tiers & Checkout Action Box */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-900/90 shadow-2xl space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Select Ticket Tier</h3>
                <p className="text-xs text-slate-400">Guaranteed instant cryptographic issuance</p>
              </div>
              <Ticket className="w-6 h-6 text-indigo-400" />
            </div>

            {waitlistSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>You have been added to the waitlist! Organizers will auto-promote you as spots clear.</span>
              </div>
            )}

            {/* Ticket Tier Cards List */}
            <div className="space-y-3">
              {event.ticketTiers.map(tier => {
                const isSoldOut = tier.soldCount >= tier.totalCapacity;
                const isSelected = selectedTier?.id === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => !isSoldOut && setSelectedTier(tier)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSoldOut
                        ? 'bg-slate-900/40 border-slate-800 opacity-70 cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{tier.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                      </div>
                      <span className="font-display font-bold text-lg text-white">${tier.price}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className={isSoldOut ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isSoldOut ? 'SOLD OUT' : `${tier.totalCapacity - tier.soldCount} passes remaining`}
                      </span>

                      {isSoldOut && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWaitlist(tier.id);
                          }}
                          className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold"
                        >
                          Join Waitlist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Checkout Trigger Button */}
            {selectedTier && selectedTier.soldCount < selectedTier.totalCapacity ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 rounded-2xl glow-button text-white font-bold text-base shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                Reserve {selectedTier.name} (${selectedTier.price})
              </button>
            ) : (
              <p className="text-xs text-center text-slate-400">
                Selected tier is sold out. Select an available pass or join waitlist.
              </p>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Backed by Stripe Connect Market Payouts & Anti-Double-Spend QR
            </div>

          </div>

        </div>

      </div>

      {/* Stripe Checkout Modal */}
      <CheckoutModal
        event={event}
        tier={selectedTier}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(tickets) => {
          setIsCheckoutOpen(false);
          onCheckoutSuccess(tickets);
        }}
      />

    </div>
  );
};
