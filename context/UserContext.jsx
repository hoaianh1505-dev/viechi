'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking a flag in localStorage or an API
    const checkUser = async () => {
      try {
        const savedUser = localStorage.getItem('vietchi_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {}
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('vietchi_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('vietchi_user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
