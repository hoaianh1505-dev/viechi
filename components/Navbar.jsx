'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Fish, LayoutDashboard, LogOut, UserCircle2 } from 'lucide-react';

const Navbar = () => {
  const { isAdmin, logout } = useProducts();
  const router = useRouter();

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
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {isAdmin ? (
            <>
              <Link href="/admin" className="btn btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.35rem' }}>
                <LayoutDashboard size={15} /> <span className="hide-mobile">Quản trị</span>
              </Link>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.35rem' }}
              >
                <LogOut size={15} /> <span className="hide-mobile">Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="btn btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.35rem' }}>
              <UserCircle2 size={15} /> Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
