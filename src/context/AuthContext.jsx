import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'usr_att_1',
    name: 'Sarah Connor',
    email: 'sarah@attendee.com',
    role: 'ATTENDEE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  });
  const [token, setToken] = useState('demo_token');

  // Persona quick-switcher for testing both roles effortlessly
  const switchPersona = async (role) => {
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setToken(data.token);
      }
    } catch (err) {
      console.warn('Persona switch fallback:', err);
      if (role === 'ORGANIZER') {
        setUser({
          id: 'usr_org_1',
          name: 'Alex Vance',
          email: 'organizer@gatherly.io',
          role: 'ORGANIZER',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        });
      } else {
        setUser({
          id: 'usr_att_1',
          name: 'Sarah Connor',
          email: 'sarah@attendee.com',
          role: 'ATTENDEE',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, switchPersona }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
