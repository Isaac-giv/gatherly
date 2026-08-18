import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, MapPin, Ticket, Plus, Trash2, Image, Sparkles, Check } from 'lucide-react';

export const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: '',
    venueName: '',
    venueAddress: '',
    venueLat: 37.7749,
    venueLng: -122.4194,
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 16),
    ticketTiers: [
      { name: 'General Admission', price: 99, totalCapacity: 200, description: 'Standard entry pass' },
      { name: 'VIP Pass', price: 249, totalCapacity: 50, description: 'VIP Lounge & Priority seating' }
    ]
  });

  if (!isOpen) return null;

  const handleAddTier = () => {
    setFormData({
      ...formData,
      ticketTiers: [
        ...formData.ticketTiers,
        { name: 'Early Bird Pass', price: 49, totalCapacity: 100, description: 'Limited discounted entry' }
      ]
    });
  };

  const handleRemoveTier = (index) => {
    if (formData.ticketTiers.length === 1) return;
    setFormData({
      ...formData,
      ticketTiers: formData.ticketTiers.filter((_, i) => i !== index)
    });
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...formData.ticketTiers];
    updated[index][field] = value;
    setFormData({ ...formData, ticketTiers: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          organizerId: user.id,
          organizerName: user.name
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsSubmitting(false);
        onCreated(data);
        onClose();
      } else {
        alert(data.error || 'Failed to create event');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0f172a] shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Multi-step Event Creator
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-0.5">Create New Gathering</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold">
          <button 
            onClick={() => setStep(1)}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 1 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">1</span>
            Basic Info
          </button>
          <button 
            onClick={() => setStep(2)}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 2 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">2</span>
            Venue & Time
          </button>
          <button 
            onClick={() => setStep(3)}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition-all ${
              step === 3 ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-transparent text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">3</span>
            Ticket Tiers
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Tech & Design Expo 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tech">Tech & AI</option>
                    <option value="Music">Music & Festival</option>
                    <option value="Food">Food & Beverage</option>
                    <option value="Nightlife">Nightlife & Clubs</option>
                    <option value="Art">Art & Culture</option>
                    <option value="Wellness">Wellness & Sports</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Rich Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe your event, speakers, agenda, and expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Venue & Dates */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Venue Name</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco Metreon Center"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Venue Address</label>
                <input
                  type="text"
                  placeholder="e.g. 135 4th St, San Francisco, CA 94103"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Ticket Tiers Constructor */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Custom Ticket Tiers</span>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-3 py-1 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold border border-indigo-500/30 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Ticket Tier
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {formData.ticketTiers.map((tier, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 relative">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Tier Name (VIP, Early Bird...)"
                        value={tier.name}
                        onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Total Capacity Cap</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.totalCapacity}
                          onChange={(e) => handleTierChange(idx, 'totalCapacity', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30"
              >
                Continue to Step {step + 1}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing Event...' : (
                  <>
                    <Check className="w-4 h-4" /> Publish Live Event
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
