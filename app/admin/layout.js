'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  Settings, LogOut, ChevronLeft, ChevronRight,
  Truck, MessageSquare, Bell, Home, ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { settings } = useSettings();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Sản phẩm', icon: Package, path: '/admin/products' },
    { name: 'Đơn hàng', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Phí vận chuyển', icon: Truck, path: '/admin/shipping' },
    { name: 'Người dùng', icon: Users, path: '/admin/users' },
    { name: 'Cấu hình web', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff9f5' }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? '80px' : '280px',
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 25,
          mass: 0.8
        }}
        style={{
          background: '#fff3ea', // Tone cam nhạt chuẩn web
          borderRight: '1px solid #ffe2cc',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          overflow: 'hidden'
        }}
      >
        {/* Toggle Button at top */}
        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', padding: '1rem' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              border: '1px solid #ffd8bf',
              background: '#fff',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(212,96,10,0.12)',
              transition: 'all 0.2s'
            }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Logo Area */}
        <div style={{ 
          padding: '0 1.5rem 2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'contain', background: '#fff', padding: '2px' }} />
          ) : (
            <div style={{ 
              width: '42px', height: '42px', borderRadius: '12px', 
              background: 'var(--gradient)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212, 96, 10, 0.3)'
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem' }}>{settings?.siteName?.charAt(0) || 'V'}</span>
            </div>
          )}
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>
                {settings?.siteName || 'VietChi'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Quản trị viên</span>
            </motion.div>
          )}
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '0 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 5, background: isActive ? 'var(--primary-light)' : 'rgba(212,96,10,0.05)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '14px',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <item.icon size={22} style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : '#94a3b8' }} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActive"
                      style={{ position: 'absolute', left: '-1rem', width: '4px', height: '60%', background: 'var(--primary)', borderRadius: '0 4px 4px 0' }} 
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Back to Client Site Link */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #ffe2cc' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.02, background: 'var(--primary-dark)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                background: 'var(--primary)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 8px 20px rgba(212, 96, 10, 0.25)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                overflow: 'hidden'
              }}
            >
              <Home size={22} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                  >
                    Quay lại cửa hàng
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <button style={{ position: 'relative', background: '#fff', border: '1px solid #ffe2cc', padding: '0.7rem', borderRadius: '14px', cursor: 'pointer', color: '#64748b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 1.2rem', background: '#fff', borderRadius: '100px', border: '1px solid #ffe2cc', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}>A</div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Quản trị viên</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
