import React, { useState, useEffect } from 'react';
import { EventCard } from '../components/EventCard';
import { Search, Filter, Sparkles, MapPin, Calendar as CalendarIcon, Tag, Flame } from 'lucide-react';

export const EventFeedPage = ({ onSelectEvent, onCreateEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState(500);

  const categories = ['All', 'Tech', 'Music', 'Food', 'Nightlife', 'Art', 'Wellness'];

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery, maxPriceFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (maxPriceFilter < 500) params.append('maxPrice', maxPriceFilter);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setLoading(false);
    }
  };

  const featuredEvent = events[0];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-indigo-500/20 p-8 sm:p-12 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Discover Extraordinary Gatherings & Live Experiences
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            Unforgettable events. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Seamless ticketing.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-light">
            Gatherly connects passionate organizers with attendees through real-time ticketing, instant QR check-ins, and exclusive VIP passes.
          </p>

          {/* Search & Location Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search events by title, venue, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onCreateEventClick}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl glow-button text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" /> Create Event
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Category Pills & Filters Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Max Price: <strong className="text-indigo-300">${maxPriceFilter}</strong></span>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              className="accent-indigo-500 w-24 cursor-pointer"
            />
          </div>

        </div>
      </section>

      {/* Featured Spotlight Event */}
      {featuredEvent && selectedCategory === 'All' && !searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Flame className="w-4 h-4 animate-pulse" /> Spotlight Featured Event
          </div>
          <div 
            onClick={() => onSelectEvent(featuredEvent)}
            className="glass-panel group rounded-3xl overflow-hidden border border-indigo-500/30 bg-slate-900/80 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-indigo-500/60 transition-all shadow-xl"
          >
            <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden">
              <img 
                src={featuredEvent.bannerUrl} 
                alt={featuredEvent.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#0b0f19]/40 to-[#0b0f19]" />
            </div>
            <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold">
                  FEATURED • {featuredEvent.category}
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white group-hover:text-indigo-400 transition-colors">
                  {featuredEvent.title}
                </h2>
                <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Starting From</span>
                  <span className="text-xl font-black text-emerald-400">
                    ${Math.min(...featuredEvent.ticketTiers.map(t => t.price))}
                  </span>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30">
                  Explore & Reserve
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Events */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-white">
            Upcoming Events ({events.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
            <p className="text-slate-400 text-sm">No events found matching your current filter criteria.</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setMaxPriceFilter(500); }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event._id} event={event} onSelect={onSelectEvent} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
