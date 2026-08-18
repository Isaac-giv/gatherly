import express from 'express';
import { memoryStore } from '../db.js';

const router = express.Router();

// Validate and process QR Code Check-in
router.post('/scan', (req, res) => {
  try {
    const { qrCodeHash } = req.body;
    if (!qrCodeHash) {
      return res.status(400).json({ error: 'QR Code Hash is required for scan validation' });
    }

    const ticket = memoryStore.findTicketByHash(qrCodeHash);
    if (!ticket) {
      return res.status(404).json({
        valid: false,
        status: 'INVALID_TICKET',
        message: 'Invalid or unknown ticket QR code hash.'
      });
    }

    const checkInResult = memoryStore.checkInTicket(ticket._id);

    if (!checkInResult.success && checkInResult.error === 'ALREADY_CHECKED_IN') {
      return res.status(400).json({
        valid: false,
        status: 'ALREADY_CHECKED_IN',
        message: `TICKET ALREADY CHECKED IN at ${new Date(ticket.checkedInAt).toLocaleTimeString()}`,
        ticket
      });
    }

    // Broadcast check-in event to organizer dashboard via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('ticket_checked_in', {
        ticketId: ticket._id,
        attendeeName: ticket.userName,
        eventTitle: ticket.eventTitle,
        tierName: ticket.ticketTierName,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      valid: true,
      status: 'VALIDATED',
      message: `VALID ENTRY - Welcome, ${ticket.userName}!`,
      ticket: checkInResult.ticket
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lookup ticket info by hash without performing check-in
router.get('/verify/:hash', (req, res) => {
  try {
    const ticket = memoryStore.findTicketByHash(req.params.hash);
    if (!ticket) return res.status(404).json({ valid: false, error: 'Ticket not found' });
    res.json({ valid: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
