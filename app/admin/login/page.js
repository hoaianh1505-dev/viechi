'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Lock, UserCircle2, AlertCircle, Fish } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useProducts();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      router.push('/admin');
    } else {
      setError('Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-section)',
      padding: '2rem 1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 6px 20px rgba(212,96,10,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem' }}>V</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Đăng nhập</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>Trang quản trị VietChi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <UserCircle2 size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input" style={{ paddingLeft: '2.4rem' }} placeholder="admin" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" style={{ paddingLeft: '2.4rem' }} placeholder="••••••••" required />
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff1f0', border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: '8px', padding: '0.65rem 0.9rem',
              color: 'var(--red)', fontSize: '0.83rem',
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Đăng nhập
          </button>
        </form>
      </motion.div>
    </div>
  );
}
