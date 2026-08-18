import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('gatherly_token');
    const savedUser = localStorage.getItem('gatherly_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gatherly_token');
        localStorage.removeItem('gatherly_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('gatherly_token', jwtToken);
    localStorage.setItem('gatherly_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveSession(data.user, data.token);
    return data.user;
  };

  const register = async (name, email, password, role = 'ATTENDEE') => {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    saveSession(data.user, data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gatherly_token');
    localStorage.removeItem('gatherly_user');
  };

  // Quick persona switcher for demo (keeps existing demo UX)
  const switchPersona = async (role) => {
    try {
      const res = await fetch(apiUrl('/api/auth/switch-persona'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.user) {
        saveSession(data.user, data.token);
      }
    } catch (err) {
      // Fallback if server unreachable
      const fallback = role === 'ORGANIZER'
        ? { id: 'usr_org_1', name: 'Alex Vance', email: 'organizer@gatherly.io', role: 'ORGANIZER', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' }
        : { id: 'usr_att_1', name: 'Sarah Connor', email: 'sarah@attendee.com', role: 'ATTENDEE', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80' };
      setUser(fallback);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchPersona }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
