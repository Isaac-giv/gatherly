import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import orderRoutes from './routes/orders.js';
import checkinRoutes from './routes/checkin.js';
import analyticsRoutes from './routes/analytics.js';
import { startBackgroundJobs } from './services/queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root regardless of CWD
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const server = http.createServer(app);

// Enable Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socketio instance to express app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Track live room viewers for FOMO count
const eventViewersMap = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Client Connected to Socket.io: ${socket.id}`);

  // Join Event Detail Room
  socket.on('join_event_room', (eventId) => {
    socket.join(`event_${eventId}`);
    const currentCount = (eventViewersMap.get(eventId) || 0) + 1;
    eventViewersMap.set(eventId, currentCount);

    // Broadcast updated viewer count to everyone viewing this event page
    io.to(`event_${eventId}`).emit('viewer_count_updated', {
      eventId,
      viewerCount: currentCount + 4 // Add realistic baseline viewer offset for demo presentation
    });
  });

  // Leave Event Detail Room
  socket.on('leave_event_room', (eventId) => {
    socket.leave(`event_${eventId}`);
    const currentCount = Math.max(0, (eventViewersMap.get(eventId) || 1) - 1);
    eventViewersMap.set(eventId, currentCount);

    io.to(`event_${eventId}`).emit('viewer_count_updated', {
      eventId,
      viewerCount: currentCount + 4
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client Disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Gatherly Event Management & Ticketing Engine',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend if dist folder exists (production / Render deployment)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startBackgroundJobs(io);
  server.listen(PORT, () => {
    console.log(`🚀 Gatherly Backend Server running on http://localhost:${PORT}`);
    console.log(`   Frontend dev server: http://localhost:3000  (run: npm run dev)`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌  Port ${PORT} is already in use.`);
      console.error(`   Run this to find and kill the process:`);
      console.error(`   cmd /c "netstat -ano | findstr :${PORT}"`);
      console.error(`   Then kill it with: taskkill /PID <PID> /F\n`);
      process.exit(1);
    }
    throw err;
  });
});
