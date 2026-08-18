import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { X, CreditCard, ShieldCheck, Clock, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export const CheckoutModal = ({ event, tier, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins (900 seconds) reservation hold
  const [cardHolder, setCardHolder] = useState(user.name);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !event || !tier) return null;

  const unitPrice = tier.price;
  const subtotal = unitPrice * quantity;
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% platform fee (Stripe Connect Marketplace)
  const totalAmount = subtotal + platformFee;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          eventId: event._id,
          ticketTierId: tier.id,
          quantity
        })
      });

      const data = await res.json();

      if (data.success) {
        // Trigger celebratory confetti animation!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          setIsProcessing(false);
          onSuccess(data.tickets);
          onClose();
        }, 1200);
      } else {
        alert(data.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0f172a] shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Stripe Connect Secure Checkout
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mt-1">Complete Ticket Purchase</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hold Timer Bar */}
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-indigo-400 animate-pulse" /> Tickets held for:
          </span>
          <span className="font-mono font-bold text-indigo-200 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-500/30">
            {formattedTime}
          </span>
        </div>

        {/* Content Body */}
        <form onSubmit={handlePay} className="p-6 space-y-6">
          
          {/* Order Summary Box */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white text-sm">{event.title}</h4>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">{tier.name}</p>
              </div>
              <span className="text-sm font-bold text-white">${tier.price} / ticket</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300">Select Quantity</label>
              <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm text-white px-1">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(5, quantity + 1))}
                  className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal ({quantity}x)</span>
                <span className="text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">Platform Service Fee (5%)</span>
                <span className="text-slate-200">${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-indigo-400 text-base">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Stripe Card Input Simulation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-400" /> Payment Details
              </span>
              <span className="text-[11px] text-slate-400">Powered by Stripe Connect</span>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Expires</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl glow-button text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/30"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing via Stripe...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-200" />
                Pay ${totalAmount.toFixed(2)} & Issue Ticket
              </span>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit SSL Cryptographically Signed Instant Ticket Delivery
          </p>

        </form>

      </div>
    </div>
  );
};
