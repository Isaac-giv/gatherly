import express from 'express';
import { memoryStore } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List events with search/filter query parameters
router.get('/', (req, res) => {
  try {
    const { category, search, maxPrice } = req.query;
    const events = memoryStore.getEvents({ category, search, maxPrice });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single event detail
router.get('/:id', (req, res) => {
  try {
    const event = memoryStore.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Add real-time waitlist stats
    const waitlist = memoryStore.getWaitlistForEvent(req.params.id);
    res.json({
      ...event,
      waitlistCount: waitlist.filter(w => w.status === 'WAITING').length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new event — Organizer only
router.post('/', requireAuth, requireRole('ORGANIZER'), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      bannerUrl,
      venueName,
      venueAddress,
      venueLat,
      venueLng,
      startDate,
      endDate,
      ticketTiers,
      organizerId,
      organizerName
    } = req.body;

    if (!title || !description || !category || !ticketTiers || ticketTiers.length === 0) {
      return res.status(400).json({ error: 'Missing required event fields' });
    }

    const formattedTiers = ticketTiers.map((tier, idx) => ({
      id: `tier_${Date.now()}_${idx}`,
      name: tier.name,
      price: Number(tier.price),
      totalCapacity: Number(tier.totalCapacity),
      soldCount: 0,
      description: tier.description || ''
    }));

    const newEvent = memoryStore.addEvent({
      title,
      description,
      category,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      venueName: venueName || 'Gatherly Main Hall',
      venueAddress: venueAddress || '100 Innovation Way, San Francisco, CA',
      venueLat: Number(venueLat) || 37.7749,
      venueLng: Number(venueLng) || -122.4194,
      organizerId: organizerId || 'usr_org_1',
      organizerName: organizerName || 'Alex Vance (Gatherly Organizer)',
      startDate: startDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      endDate: endDate || new Date(Date.now() + 86400000 * 8).toISOString(),
      ticketTiers: formattedTiers
    });

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
