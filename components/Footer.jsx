'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer style={{ 
      background: '#fff', 
      borderTop: '1px solid var(--border-card)', 
      padding: '4rem 0 2rem', 
      marginTop: 'auto' 
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.siteName} style={{ height: '32px' }} />
              ) : (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>{settings?.siteName?.charAt(0) || 'V'}</span>
                </div>
              )}
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>{settings?.siteName || 'VietChi'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {settings?.siteTitle || 'Mang hương vị truyền thống đến mọi gian bếp Việt. Cam kết chất lượng thượng hạng.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem' }}>Sản phẩm</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="/shop" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Tất cả sản phẩm</a></li>
              <li><a href="/category/dac-san" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Đặc sản vùng miền</a></li>
              <li><a href="/category/hai-san" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Hải sản khô</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem' }}>Liên hệ</h4>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              <strong>Hotline:</strong> {settings?.contactPhone || '090 123 4567'}
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              <strong>Email:</strong> {settings?.contactEmail || 'contact@example.com'}
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <strong>Địa chỉ:</strong> {settings?.address || 'Việt Nam'}
            </p>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-card)', 
          paddingTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--primary)' }}>{settings?.siteName}</strong> — {settings?.siteTitle}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Giao hàng toàn quốc</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
