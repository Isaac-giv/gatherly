import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight, Flame } from 'lucide-react';

export const EventCard = ({ event, onSelect }) => {
  const minPrice = event.ticketTiers && event.ticketTiers.length > 0
    ? Math.min(...event.ticketTiers.map(t => t.price))
    : 0;

  const totalCapacity = event.ticketTiers?.reduce((acc, t) => acc + t.totalCapacity, 0) || 100;
  const totalSold = event.ticketTiers?.reduce((acc, t) => acc + (t.soldCount || 0), 0) || 0;
  const percentSold = Math.min(100, Math.round((totalSold / totalCapacity) * 100));

  const isSoldOut = event.ticketTiers?.every(t => t.soldCount >= t.totalCapacity);

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onSelect(event)}
      className="glass-card group rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-slate-800 bg-slate-900/60"
    >
      {/* Banner Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <img 
          src={event.bannerUrl} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <Tag className="w-3 h-3 text-indigo-400" />
          {event.category}
        </div>

        {/* Status Badge */}
        {isSoldOut ? (
          <div className="absolute top-3 right-3 bg-rose-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            SOLD OUT
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-400 animate-pulse" />
            From ${minPrice}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-display font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Date & Location */}
          <div className="mt-3 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Capacity Bar & Action */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>Capacity</span>
            <span className={percentSold > 85 ? 'text-amber-400' : 'text-slate-300'}>
              {totalSold} / {totalCapacity} Sold ({percentSold}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentSold >= 100 
                  ? 'bg-rose-500' 
                  : percentSold > 80 
                    ? 'bg-amber-500' 
                    : 'bg-indigo-500'
              }`} 
              style={{ width: `${percentSold}%` }} 
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
            <span>View Tickets & Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
