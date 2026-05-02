'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { Fish, LayoutDashboard, LogOut, UserCircle2, ShoppingCart, User, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useUser();
  const { cartCount, setIsCartOpen } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid var(--border-card)',
      boxShadow: '0 1px 8px rgba(180,80,20,0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '58px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(212,96,10,0.3)',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>V</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VietChi
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="btn btn-ghost"
            style={{ position: 'relative', padding: '0.5rem', minWidth: 'auto', background: 'var(--bg-section)' }}
          >
            <ShoppingCart size={20} color="var(--primary)" />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--red)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 800,
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                border: '2px solid #fff'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-card)', margin: '0 0.25rem' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.35rem', color: 'var(--primary)' }}>
                  <LayoutDashboard size={15} /> <span className="hide-mobile">Quản trị</span>
                </Link>
              )}
              <Link href="/orders" className="btn btn-ghost" style={{ padding: '0.45rem', minWidth: 'auto', color: 'var(--text-muted)' }} title="Đơn hàng của tôi">
                <ShoppingBag size={18} />
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.8rem', background: 'var(--bg-section)', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <User size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }} className="hide-mobile">{user.name}</span>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: '0.2rem' }}>
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link href="/login" className="btn btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                Đăng nhập
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
