'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { LayoutDashboard, LogOut, ShoppingCart, User, ShoppingBag, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useUser();
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header style={{
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(212,96,10,0.08)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.06)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" style={{ 
              height: '40px', width: 'auto', borderRadius: '10px',
              transition: 'transform 0.2s'
            }} />
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212,96,10,0.3)',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem' }}>{settings?.siteName?.charAt(0) || 'V'}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#1e293b', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {settings?.siteName || 'VietChi'}
            </span>
            <span className="hide-mobile" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              {settings?.siteTitle || 'Đặc sản thượng hạng'}
            </span>
          </div>
        </Link>

        {/* Center Nav Links - Desktop */}
        <nav className="hide-mobile" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: 'rgba(248,250,252,0.8)', 
          padding: '0.3rem',
          borderRadius: '14px',
          border: '1px solid rgba(226,232,240,0.6)'
        }}>
          {[
            { label: 'Trang chủ', href: '/' },
            { label: 'Sản phẩm', href: '/#products-section' },
            { label: 'Về chúng tôi', href: '/#about' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#475569',
              textDecoration: 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--primary-light)'; e.target.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#475569'; }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ 
              position: 'relative', 
              width: '42px', height: '42px',
              borderRadius: '12px',
              border: '1px solid rgba(226,232,240,0.8)',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.background = '#fff'; }}
          >
            <ShoppingCart size={19} color="var(--primary)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--gradient)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 900,
                width: '20px', height: '20px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(212,96,10,0.4)',
                border: '2.5px solid #fff'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 0.15rem' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isAdmin && (
                <Link href="/admin" style={{ 
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(212,96,10,0.15)',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffe0c8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-light)'; }}
                >
                  <LayoutDashboard size={14} /> <span className="hide-mobile">Quản trị</span>
                </Link>
              )}
              <Link href="/orders" style={{
                width: '42px', height: '42px', borderRadius: '12px',
                border: '1px solid rgba(226,232,240,0.8)',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', textDecoration: 'none', transition: 'all 0.2s'
              }} title="Đơn hàng của tôi"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'; e.currentTarget.style.color = '#64748b'; }}
              >
                <ShoppingBag size={18} />
              </Link>

              {/* User Pill */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                padding: '0.35rem 0.5rem 0.35rem 0.75rem',
                background: '#f8fafc',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.7rem' }}>{user.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <span className="hide-mobile" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                <button 
                  onClick={handleLogout} 
                  title="Đăng xuất"
                  style={{ 
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.08)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/login" style={{
                padding: '0.55rem 1.2rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#475569',
                textDecoration: 'none',
                transition: 'all 0.2s',
                border: '1px solid transparent'
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.target.style.color = '#475569'; }}
              >
                Đăng nhập
              </Link>
              <Link href="/register" style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#fff',
                background: 'var(--gradient)',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(212,96,10,0.25)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(212,96,10,0.35)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(212,96,10,0.25)'; }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
