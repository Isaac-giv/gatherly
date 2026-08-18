import express from 'express';
import { memoryStore } from '../db.js';

const router = express.Router();

// Organizer Analytics Overview
router.get('/dashboard', (req, res) => {
  try {
    const { organizerId = 'usr_org_1' } = req.query;
    const analytics = memoryStore.getOrganizerAnalytics(organizerId);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export Attendee List as CSV
router.get('/export-csv', (req, res) => {
  try {
    const { eventId } = req.query;
    let tickets = memoryStore.tickets;
    if (eventId) {
      tickets = tickets.filter(t => t.eventId === eventId);
    }

    let csvContent = 'Ticket ID,Attendee Name,Attendee Email,Event Title,Tier Name,Checked In,Checked In At,Purchased At\n';
    tickets.forEach(t => {
      csvContent += `"${t._id}","${t.userName}","${t.userEmail}","${t.eventTitle}","${t.ticketTierName}","${t.isCheckedIn ? 'YES' : 'NO'}","${t.checkedInAt || 'N/A'}","${t.purchasedAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gatherly_attendee_roster_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Promote user from waitlist
router.post('/promote-waitlist', (req, res) => {
  try {
    const { waitlistId } = req.body;
    if (!waitlistId) return res.status(400).json({ error: 'waitlistId is required' });

    const promoted = memoryStore.promoteWaitlistUser(waitlistId);
    if (!promoted) return res.status(404).json({ error: 'Waitlist entry not found' });

    // Broadcast email simulation notification via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlist_promoted', {
        userEmail: promoted.userEmail,
        userName: promoted.userName,
        eventId: promoted.eventId,
        message: `Spot opened up! Promoted ${promoted.userName} from waitlist.`
      });
    }

    res.json({
      success: true,
      message: `Successfully promoted ${promoted.userName} from waitlist! Automated invitation email queued.`,
      waitlist: promoted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
