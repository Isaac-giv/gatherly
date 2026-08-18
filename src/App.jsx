import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SalesTickerToast } from './components/SalesTickerToast';
import { EventFeedPage } from './pages/EventFeedPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketVaultPage } from './pages/TicketVaultPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { ScannerAppPage } from './pages/ScannerAppPage';
import { CreateEventModal } from './components/CreateEventModal';

// Role-based tab access rules
const ROLE_TABS = {
  ATTENDEE: ['feed', 'detail', 'tickets'],
  ORGANIZER: ['feed', 'detail', 'dashboard', 'scanner'],
};

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // If role changes and current tab is no longer accessible, redirect to feed
  useEffect(() => {
    if (user) {
      const allowed = ROLE_TABS[user.role] || ['feed'];
      if (!allowed.includes(activeTab)) {
        setActiveTab('feed');
      }
    }
  }, [user?.role]);

  const handleSetTab = (tab) => {
    if (!user) return;
    const allowed = ROLE_TABS[user.role] || ['feed'];
    if (allowed.includes(tab) || tab === 'detail') {
      setActiveTab(tab);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEventId(event._id);
    setActiveTab('detail');
  };

  const handleCheckoutSuccess = () => {
    if (user?.role === 'ATTENDEE') setActiveTab('tickets');
  };

  // Show spinner while restoring session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">G</span>
          </div>
          <p className="text-slate-500 text-sm">Loading Gatherly...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19]">
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">

      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={handleSetTab} />

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

        {activeTab === 'tickets' && user.role === 'ATTENDEE' && (
          <TicketVaultPage />
        )}

        {activeTab === 'dashboard' && user.role === 'ORGANIZER' && (
          <OrganizerDashboardPage />
        )}

        {activeTab === 'scanner' && user.role === 'ORGANIZER' && (
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
            Powered by React, Express, WebSockets & MongoDB.
          </p>
        </div>
      </footer>

      {/* Real-time Sales Toast */}
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
