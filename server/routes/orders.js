import express from 'express';
import { memoryStore } from '../db.js';

const router = express.Router();

// Create Order & Process Ticket Checkout (Stripe Integration flow)
router.post('/checkout', async (req, res) => {
  try {
    const { userId, userName, userEmail, eventId, ticketTierId, quantity = 1, paymentMethodId } = req.body;
    
    if (!eventId || !ticketTierId || !userId) {
      return res.status(400).json({ error: 'Missing required order metadata' });
    }

    const event = memoryStore.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const tier = event.ticketTiers.find(t => t.id === ticketTierId);
    if (!tier) return res.status(404).json({ error: 'Ticket tier not found' });

    // Check capacity lock
    if (tier.soldCount + quantity > tier.totalCapacity) {
      return res.status(400).json({
        error: 'TIER_SOLD_OUT',
        message: 'This ticket tier is fully booked! You can join the waitlist to be notified when spots open up.',
        isSoldOut: true
      });
    }

    const totalAmount = tier.price * quantity;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-min reservation hold

    // 1. Create Pending Order
    const order = memoryStore.createOrder({
      userId,
      userEmail: userEmail || 'attendee@gatherly.io',
      userName: userName || 'Gatherly Attendee',
      eventId,
      ticketTierId,
      quantity,
      unitPrice: tier.price,
      totalAmount,
      status: 'PAID', // Simulated immediate Stripe Connect payment completion
      paymentIntentId: `pi_stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expiresAt
    });

    // 2. Issue Cryptographically Signed Ticket with QR Code
    const createdTickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await memoryStore.createTicket({
        orderId: order._id,
        userId,
        userName: order.userName,
        userEmail: order.userEmail,
        eventId: event._id,
        eventTitle: event.title,
        ticketTierId: tier.id,
        ticketTierName: tier.name
      });
      createdTickets.push(ticket);
    }

    // 3. Trigger Socket.io Sales Notification
    const io = req.app.get('socketio');
    if (io) {
      io.emit('ticket_purchased', {
        eventTitle: event.title,
        tierName: tier.name,
        buyerName: order.userName,
        amount: totalAmount,
        timestamp: new Date().toISOString()
      });

      // Update event stats for organizers
      io.emit('event_stats_updated', {
        eventId: event._id,
        soldCount: tier.soldCount,
        totalCapacity: tier.totalCapacity
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ticket successfully issued!',
      order,
      tickets: createdTickets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join Waitlist
router.post('/waitlist', (req, res) => {
  try {
    const { eventId, userId, userName, userEmail, ticketTierId } = req.body;
    if (!eventId || !userId || !ticketTierId) {
      return res.status(400).json({ error: 'Missing waitlist metadata' });
    }

    const waitlistEntry = memoryStore.addToWaitlist({
      eventId,
      userId,
      userName: userName || 'Waitlist Guest',
      userEmail: userEmail || 'attendee@gatherly.io',
      ticketTierId
    });

    res.json({
      success: true,
      message: 'You have been added to the official event waitlist!',
      waitlist: waitlistEntry
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tickets for active attendee vault
router.get('/my-tickets', (req, res) => {
  try {
    const { userId = 'usr_att_1' } = req.query;
    const tickets = memoryStore.getTicketsForUser(userId);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
