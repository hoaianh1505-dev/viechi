'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const { settings } = useSettings();

  const socialLinks = [
    { 
      name: 'Facebook',
      link: settings?.socialFacebook, 
      color: '#1877F2',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
    { 
      name: 'Instagram',
      link: settings?.socialInstagram, 
      color: '#E4405F',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    },
    { 
      name: 'Youtube',
      link: settings?.socialYoutube, 
      color: '#FF0000',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    },
  ];

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.siteName} style={{ height: '36px', borderRadius: '8px' }} />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>{settings?.siteName?.charAt(0) || 'V'}</span>
                </div>
              )}
              <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)' }}>{settings?.siteName || 'VietChi'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {settings?.brandStory || 'Mang hương vị truyền thống đến mọi gian bếp Việt. Cam kết chất lượng thượng hạng.'}
            </p>
            
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {socialLinks.map((social, idx) => (
                social.link && (
                  <a key={idx} href={social.link} target="_blank" rel="noopener noreferrer" style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: social.color, border: '1px solid #f1f5f9', transition: 'all 0.2s'
                  }}>
                    {social.icon}
                  </a>
                )
              ))}
              {settings?.socialTiktok && (
                <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', border: '1px solid #f1f5f9'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Thông tin liên hệ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Phone size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Hotline & Zalo</p>
                  <p>{settings?.contactPhone || '090 123 4567'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Mail size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Email</p>
                  <p>{settings?.contactEmail || 'contact@vietchi.vn'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Cửa hàng</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Địa chỉ</p>
                  <p>{settings?.contactAddress || 'Việt Nam'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Clock size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Giờ làm việc</p>
                  <p>{settings?.workingHours || '8:00 - 22:00'}</p>
                </div>
              </div>
            </div>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--primary)' }}>{settings?.siteName}</strong> — {settings?.footerText || 'Tinh hoa hải sản Việt'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600 }}>Giao hàng toàn quốc 🚚</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
