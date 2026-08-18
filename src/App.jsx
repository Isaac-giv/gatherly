import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { SalesTickerToast } from './components/SalesTickerToast';
import { EventFeedPage } from './pages/EventFeedPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketVaultPage } from './pages/TicketVaultPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { ScannerAppPage } from './pages/ScannerAppPage';
import { CreateEventModal } from './components/CreateEventModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'detail', 'tickets', 'dashboard', 'scanner'
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEventId(event._id);
    setActiveTab('detail');
  };

  const handleCheckoutSuccess = (tickets) => {
    // Switch to Digital Ticket Vault after successful purchase
    setActiveTab('tickets');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {activeTab === 'feed' && (
          <EventFeedPage 
            onSelectEvent={handleSelectEvent}
            onCreateEventClick={() => setIsCreateModalOpen(true)}
          />
        )}

        {activeTab === 'detail' && selectedEventId && (
          <EventDetailPage 
            eventId={selectedEventId}
            onBack={() => setActiveTab('feed')}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketVaultPage />
        )}

        {activeTab === 'dashboard' && (
          <OrganizerDashboardPage />
        )}

        {activeTab === 'scanner' && (
          <ScannerAppPage />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#070a12] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white text-sm">Gatherly</span>
            <span>• Full-Stack Event Management & Ticketing Engine</span>
          </div>
          <p className="text-slate-400">
            Powered by React, Express, WebSockets, MongoDB, Stripe Connect & BullMQ Jobs.
          </p>
        </div>
      </footer>

      {/* Real-time Sales Toast Popup */}
      <SalesTickerToast />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newEvent) => {
          setIsCreateModalOpen(false);
          handleSelectEvent(newEvent);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
