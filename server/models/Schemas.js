import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ORGANIZER', 'ATTENDEE'], default: 'ATTENDEE' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// TicketTier Subschema
const ticketTierSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }, // e.g., VIP Pass, Early Bird, General Admission
  price: { type: Number, required: true },
  totalCapacity: { type: Number, required: true },
  soldCount: { type: Number, default: 0 },
  description: { type: String }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // Music, Tech, Food, Nightlife, Art, Wellness
  bannerUrl: { type: String, required: true },
  venueName: { type: String, required: true },
  venueAddress: { type: String, required: true },
  venueLat: { type: Number, default: 37.7749 },
  venueLng: { type: Number, default: -122.4194 },
  organizerId: { type: String, required: true },
  organizerName: { type: String, default: 'Gatherly Live Events' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  ticketTiers: [ticketTierSchema],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  eventId: { type: String, required: true },
  ticketTierId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'], default: 'PENDING' },
  paymentIntentId: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Ticket Schema
const ticketSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  ticketTierId: { type: String, required: true },
  ticketTierName: { type: String, required: true },
  qrCodeHash: { type: String, required: true, unique: true },
  qrCodeDataUrl: { type: String },
  isCheckedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  purchasedAt: { type: Date, default: Date.now }
});

// Waitlist Schema
const waitlistSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  ticketTierId: { type: String, required: true },
  status: { type: String, enum: ['WAITING', 'PROMOTED', 'EXPIRED'], default: 'WAITING' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);
