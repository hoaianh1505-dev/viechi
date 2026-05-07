'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, ShoppingCart, User, ShoppingBag, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useUser();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    
    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sản phẩm', href: '/#products-section' },
    { label: 'Về chúng tôi', href: '/#about' },
  ];

  return (
    <header style={{
      background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderBottom: '1px solid rgba(212, 96, 10, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      height: isMobile ? '64px' : '74px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px',
              border: 'none', background: 'rgba(212, 96, 10, 0.05)',
              color: 'var(--primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            width: isMobile ? '36px' : '44px', 
            height: isMobile ? '36px' : '44px', 
            borderRadius: '12px',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(212, 96, 10, 0.25)',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: isMobile ? '1.1rem' : '1.4rem' }}>{settings?.siteName?.charAt(0) || 'V'}</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: isMobile ? '1.15rem' : '1.4rem', color: '#1e293b', letterSpacing: '-0.5px' }}>
            {settings?.siteName || 'VietChi'}
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        {!isMobile && (
          <nav style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#f8fafc', padding: '0.4rem', borderRadius: '16px',
            border: '1px solid #f1f5f9'
          }}>
            {navLinks.map(item => (
              <Link key={item.label} href={item.href} style={{
                padding: '0.5rem 1.25rem', borderRadius: '12px',
                fontSize: '0.9rem', fontWeight: 700, color: '#64748b',
                textDecoration: 'none', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.background = '#fff'; e.target.style.color = 'var(--primary)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b'; e.target.style.boxShadow = 'none'; }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.8rem' }}>
          {user && !isMobile && (
            <Link href="/my-orders" style={{ 
              padding: '0.5rem 1rem', borderRadius: '12px',
              fontSize: '0.85rem', fontWeight: 800, color: '#475569',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <ShoppingBag size={16} /> Đơn hàng
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ 
              position: 'relative', width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px',
              borderRadius: '14px', border: '1px solid #f1f5f9',
              background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <ShoppingCart size={isMobile ? 20 : 22} color="var(--primary)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--gradient)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 900,
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(212, 96, 10, 0.3)',
                border: '3px solid #fff'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {!isMobile && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.6rem', 
                  padding: '0.35rem 0.8rem 0.35rem 0.35rem', background: '#f8fafc',
                  borderRadius: '100px', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{user.name}</span>
                  <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><LogOut size={16} /></button>
                </div>
              </div>
            ) : (
              <Link href="/login" style={{
                padding: '0.6rem 1.25rem', borderRadius: '14px',
                fontSize: '0.9rem', fontWeight: 800, color: '#fff',
                background: 'var(--gradient)', textDecoration: 'none',
                boxShadow: '0 10px 20px -5px rgba(212, 96, 10, 0.3)'
              }}>
                Đăng nhập
              </Link>
            )
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
              background: '#fff', zIndex: 999, padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}
          >
            {navLinks.map(item => (
              <Link key={item.label} href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '1.25rem', borderRadius: '20px',
                  background: '#f8fafc', color: '#1e293b',
                  fontSize: '1.1rem', fontWeight: 800,
                  textDecoration: 'none', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                {item.label}
              </Link>
            ))}
            
            <div style={{ height: '1px', background: '#f1f5f9', margin: '1rem 0' }} />
            
            {user ? (
              <>
                <Link href="/my-orders" onClick={() => setMobileMenuOpen(false)} style={{
                  padding: '1.25rem', borderRadius: '20px', background: 'var(--primary-light)',
                  color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 800,
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                  <ShoppingBag size={22} /> Đơn hàng của tôi
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{
                    padding: '1.25rem', borderRadius: '20px', background: '#f0f9ff',
                    color: '#0369a1', fontSize: '1.1rem', fontWeight: 800,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <LayoutDashboard size={22} /> Quản trị viên
                  </Link>
                )}
                <button onClick={handleLogout} style={{
                  padding: '1.25rem', borderRadius: '20px', background: '#fff1f2',
                  color: '#e11d48', fontSize: '1.1rem', fontWeight: 800,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto'
                }}>
                  <LogOut size={22} /> Đăng xuất
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
                padding: '1.25rem', borderRadius: '20px', background: 'var(--gradient)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 800,
                textDecoration: 'none', textAlign: 'center',
                boxShadow: '0 10px 20px rgba(212, 96, 10, 0.2)'
              }}>
                Đăng nhập ngay
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
