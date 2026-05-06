'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ChatBot from './ChatBot';
import { useSettings } from '@/context/SettingsContext';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');
  const { settings } = useSettings();

  if (isAdminPath) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {settings?.announcementActive && (
        <div style={{ 
          background: 'var(--gradient)', 
          color: '#fff', 
          padding: '0.6rem 1rem', 
          textAlign: 'center', 
          fontSize: '0.85rem', 
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          {settings.announcementText}
        </div>
      )}
      <Navbar />
      <CartDrawer />
      <ChatBot />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
