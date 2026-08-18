import mongoose from 'mongoose';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Initial Mock Seed Data for Fallback & Instant Demo
const defaultUsers = [
  {
    _id: 'usr_org_1',
    name: 'Alex Vance',
    email: 'organizer@gatherly.io',
    password: 'password123',
    role: 'ORGANIZER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  },
  {
    _id: 'usr_att_1',
    name: 'Sarah Connor',
    email: 'sarah@attendee.com',
    password: 'password123',
    role: 'ATTENDEE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  },
  {
    _id: 'usr_att_2',
    name: 'Marcus Chen',
    email: 'marcus@devs.io',
    password: 'password123',
    role: 'ATTENDEE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  }
];

const defaultEvents = [
  {
    _id: 'evt_101',
    title: 'Neon Horizon: AI & Web3 Summit 2026',
    description: 'Join 5,000+ tech leaders, builders, and visionaries for 3 immersive days of futuristic keynote presentations, high-impact networking, hands-on workshops, and exclusive VIP afterparties in downtown San Francisco.',
    category: 'Tech',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    venueName: 'The Palace of Fine Arts & Innovation Center',
    venueAddress: '3301 Lyon St, San Francisco, CA 94123',
    venueLat: 37.8024,
    venueLng: -122.4485,
    organizerId: 'usr_org_1',
    organizerName: 'Nexus Tech Events',
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    ticketTiers: [
      {
        id: 'tier_101_vip',
        name: 'VIP All-Access Pass',
        price: 299,
        totalCapacity: 50,
        soldCount: 38,
        description: 'Includes front-row seating, VIP lounge access, open bar, and executive speaker dinner.'
      },
      {
        id: 'tier_101_early',
        name: 'Early Bird General Admission',
        price: 99,
        totalCapacity: 200,
        soldCount: 200, // Sold out to trigger waitlist feature demo
        description: 'Full mainstage access, exhibition hall, and developer workshop tracks.'
      },
      {
        id: 'tier_101_ga',
        name: 'Standard Pass',
        price: 149,
        totalCapacity: 300,
        soldCount: 142,
        description: 'Access to keynotes, breakout sessions, and networking hall.'
      }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    _id: 'evt_102',
    title: 'Cyberpulse Festival: Electro Live 2026',
    description: 'An explosive multi-stage electronic music festival featuring world-renowned DJs, mesmerizing laser light shows, immersive spatial audio art installations, and organic gourmet food trucks.',
    category: 'Music',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    venueName: 'Pier 27 Waterfront Pavilion',
    venueAddress: 'The Embarcadero, San Francisco, CA 94111',
    venueLat: 37.8037,
    venueLng: -122.4042,
    organizerId: 'usr_org_1',
    organizerName: 'Cyberpulse Productions',
    startDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 13).toISOString(),
    ticketTiers: [
      {
        id: 'tier_102_backstage',
        name: 'Backstage Backbeat Pass',
        price: 349,
        totalCapacity: 30,
        soldCount: 18,
        description: 'Artist lounge access, side-stage viewing platform, complimentary craft cocktails.'
      },
      {
        id: 'tier_102_ga',
        name: 'Weekend GA Pass',
        price: 119,
        totalCapacity: 500,
        soldCount: 310,
        description: 'Unrestricted festival grounds access for both days.'
      }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    _id: 'evt_103',
    title: 'Artisan Culinary & Craft Wine Expo',
    description: 'Indulge in a curated culinary journey showcasing Michelin-starred chefs, rare vintage wine tastings, artisanal cheese pairings, and interactive live cooking masterclasses.',
    category: 'Food',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    venueName: 'The Glasshouse Event Center',
    venueAddress: '2 Washington Square, San Jose, CA 95112',
    venueLat: 37.3352,
    venueLng: -121.8811,
    organizerId: 'usr_org_1',
    organizerName: 'Gourmet Guild International',
    startDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 21).toISOString(),
    ticketTiers: [
      {
        id: 'tier_103_tasting',
        name: 'Grand Sommelier Tasting Pass',
        price: 175,
        totalCapacity: 100,
        soldCount: 65,
        description: 'Unlimited wine tasting tokens + 5-course gourmet tasting menu.'
      },
      {
        id: 'tier_103_entry',
        name: 'General Admission & Sample Token',
        price: 65,
        totalCapacity: 250,
        soldCount: 120,
        description: 'Entry pass with 3 complimentary food & drink tokens.'
      }
    ],
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

const defaultOrders = [];
const defaultTickets = [];
const defaultWaitlists = [
  {
    _id: 'wait_01',
    eventId: 'evt_101',
    userId: 'usr_att_2',
    userName: 'Marcus Chen',
    userEmail: 'marcus@devs.io',
    ticketTierId: 'tier_101_early',
    status: 'WAITING',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Helper to pre-generate sample tickets for Sarah Connor
async function initSampleTickets() {
  const hash1 = crypto.createHash('sha256').update(`GTH-TICKET-evt_101-usr_att_1-tier_101_vip-${Date.now()}`).digest('hex').substring(0, 24).toUpperCase();
  const qrUrl1 = await QRCode.toDataURL(JSON.stringify({ ticketId: 'tkt_sample_1', hash: hash1, eventId: 'evt_101' }));

  defaultTickets.push({
    _id: 'tkt_sample_1',
    orderId: 'ord_sample_1',
    userId: 'usr_att_1',
    userName: 'Sarah Connor',
    userEmail: 'sarah@attendee.com',
    eventId: 'evt_101',
    eventTitle: 'Neon Horizon: AI & Web3 Summit 2026',
    ticketTierId: 'tier_101_vip',
    ticketTierName: 'VIP All-Access Pass',
    qrCodeHash: hash1,
    qrCodeDataUrl: qrUrl1,
    isCheckedIn: false,
    checkedInAt: null,
    purchasedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  });
}

initSampleTickets().catch(err => console.error('Error generating initial QR sample:', err));

// Memory Store & State Handler
class MemoryStore {
  constructor() {
    this.users = [...defaultUsers];
    this.events = [...defaultEvents];
    this.orders = [...defaultOrders];
    this.tickets = [...defaultTickets];
    this.waitlists = [...defaultWaitlists];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.users.find(u => u._id === id);
  }
  addUser(userData) {
    const newUser = { _id: `usr_${Date.now()}`, ...userData, createdAt: new Date().toISOString() };
    this.users.push(newUser);
    return newUser;
  }

  // Events
  getEvents(filters = {}) {
    let result = [...this.events];
    if (filters.category && filters.category !== 'All') {
      result = result.filter(e => e.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query) || e.venueName.toLowerCase().includes(query));
    }
    if (filters.maxPrice) {
      result = result.filter(e => e.ticketTiers.some(t => t.price <= Number(filters.maxPrice)));
    }
    return result;
  }

  getEventById(id) {
    return this.events.find(e => e._id === id);
  }

  addEvent(eventData) {
    const newEvent = {
      _id: `evt_${Date.now()}`,
      ...eventData,
      isPublished: true,
      createdAt: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  // Orders
  createOrder(orderData) {
    const newOrder = {
      _id: `ord_${Date.now()}`,
      ...orderData,
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, status, paymentIntentId = null) {
    const order = this.orders.find(o => o._id === orderId);
    if (order) {
      order.status = status;
      if (paymentIntentId) order.paymentIntentId = paymentIntentId;
    }
    return order;
  }

  // Tickets
  async createTicket({ orderId, userId, userName, userEmail, eventId, eventTitle, ticketTierId, ticketTierName }) {
    const rawString = `GTH-TKT-${eventId}-${ticketTierId}-${userId}-${Date.now()}-${Math.random()}`;
    const hash = crypto.createHash('sha256').update(rawString).digest('hex').substring(0, 24).toUpperCase();
    
    // Generate actual QR Data URL image
    const qrPayload = JSON.stringify({
      hash,
      eventId,
      ticketTierId,
      userId,
      eventTitle,
      issuer: 'Gatherly Cryptographic Ticket Engine'
    });
    
    const qrUrl = await QRCode.toDataURL(qrPayload, {
      color: { dark: '#4f46e5', light: '#ffffff' },
      width: 320,
      margin: 2
    });

    const ticket = {
      _id: `tkt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      orderId,
      userId,
      userName,
      userEmail,
      eventId,
      eventTitle,
      ticketTierId,
      ticketTierName,
      qrCodeHash: hash,
      qrCodeDataUrl: qrUrl,
      isCheckedIn: false,
      checkedInAt: null,
      purchasedAt: new Date().toISOString()
    };

    this.tickets.unshift(ticket);

    // Increment sold count on event ticket tier
    const event = this.getEventById(eventId);
    if (event) {
      const tier = event.ticketTiers.find(t => t.id === ticketTierId);
      if (tier) {
        tier.soldCount = (tier.soldCount || 0) + 1;
      }
    }

    return ticket;
  }

  getTicketsForUser(userId) {
    return this.tickets.filter(t => t.userId === userId);
  }

  findTicketByHash(hash) {
    return this.tickets.find(t => t.qrCodeHash.toUpperCase() === hash.trim().toUpperCase());
  }

  checkInTicket(ticketId) {
    const ticket = this.tickets.find(t => t._id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found' };
    if (ticket.isCheckedIn) {
      return { success: false, error: 'ALREADY_CHECKED_IN', ticket };
    }
    ticket.isCheckedIn = true;
    ticket.checkedInAt = new Date().toISOString();
    return { success: true, ticket };
  }

  // Waitlists
  addToWaitlist(waitlistData) {
    const existing = this.waitlists.find(w => w.eventId === waitlistData.eventId && w.userId === waitlistData.userId && w.status === 'WAITING');
    if (existing) return existing;
    
    const entry = {
      _id: `wait_${Date.now()}`,
      ...waitlistData,
      status: 'WAITING',
      createdAt: new Date().toISOString()
    };
    this.waitlists.unshift(entry);
    return entry;
  }

  getWaitlistForEvent(eventId) {
    return this.waitlists.filter(w => w.eventId === eventId);
  }

  promoteWaitlistUser(waitlistId) {
    const item = this.waitlists.find(w => w._id === waitlistId);
    if (item) {
      item.status = 'PROMOTED';
      item.promotedAt = new Date().toISOString();
    }
    return item;
  }

  // Analytics Metrics for Organizer
  getOrganizerAnalytics(organizerId) {
    const orgEvents = this.events.filter(e => e.organizerId === organizerId || true); // Default all demo events to current organizer dashboard view
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalCapacity = 0;
    let checkedInCount = 0;

    const eventMetrics = orgEvents.map(evt => {
      let evtRev = 0;
      let evtSold = 0;
      let evtCap = 0;

      evt.ticketTiers.forEach(t => {
        evtRev += t.price * t.soldCount;
        evtSold += t.soldCount;
        evtCap += t.totalCapacity;
      });

      totalRevenue += evtRev;
      totalTicketsSold += evtSold;
      totalCapacity += evtCap;

      const evtTickets = this.tickets.filter(t => t.eventId === evt._id);
      const evtCheckedIn = evtTickets.filter(t => t.isCheckedIn).length;
      checkedInCount += evtCheckedIn;

      return {
        eventId: evt._id,
        title: evt.title,
        revenue: evtRev,
        soldCount: evtSold,
        capacity: evtCap,
        conversionRate: evtSold > 0 ? Math.round((evtCheckedIn / evtSold) * 100) : 0,
        waitlistCount: this.waitlists.filter(w => w.eventId === evt._id && w.status === 'WAITING').length
      };
    });

    return {
      totalRevenue,
      totalTicketsSold,
      totalCapacity,
      overallAttendanceRate: totalTicketsSold > 0 ? Math.round((checkedInCount / totalTicketsSold) * 100) : 0,
      totalEvents: orgEvents.length,
      eventMetrics,
      recentSales: this.tickets.slice(0, 10)
    };
  }
}

export const memoryStore = new MemoryStore();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('⚡ Connected to MongoDB Database');
      await seedMongoDemoAccounts();
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed. Utilizing Gatherly In-Memory Store.', error.message);
    }
  } else {
    console.log('⚡ Operating with Gatherly Instant In-Memory Seeded Store');
  }
}

/**
 * Seeds hardcoded demo accounts into MongoDB on first run.
 * Uses bcrypt for proper password hashing.
 * Idempotent — safe to call on every server start.
 */
async function seedMongoDemoAccounts() {
  try {
    // Lazy import to avoid circular deps
    const { User } = await import('./models/Schemas.js');
    const bcrypt = await import('bcryptjs');

    const demoUsers = [
      {
        name: 'Alex Vance',
        email: 'organizer@gatherly.io',
        password: 'password123',
        role: 'ORGANIZER',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@attendee.com',
        password: 'password123',
        role: 'ATTENDEE',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@devs.io',
        password: 'password123',
        role: 'ATTENDEE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
      }
    ];

    for (const demo of demoUsers) {
      const exists = await User.findOne({ email: demo.email });
      if (!exists) {
        const hashed = await bcrypt.default.hash(demo.password, 12);
        await User.create({ ...demo, password: hashed });
        console.log(`✅ Seeded demo account: ${demo.email} (${demo.role})`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not seed demo accounts:', err.message);
  }
}

