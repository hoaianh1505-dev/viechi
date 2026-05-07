'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Image as ImageIcon, MessageSquare, Phone, Globe, Plus, Trash2, 
  Loader2, Star, Link as LinkIcon, MapPin, Clock, Bell, Info, Compass, Layout, CreditCard, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';

// Custom Social Icons
const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const YoutubeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);

export default function AdminSettings() {
  const { settings, fetchSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleUpload = async (file, type = 'logo', index = null) => {
    if (!file) return;
    setUploading(index !== null ? index : type);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        if (type === 'logo') setFormData(prev => ({ ...prev, logo: data.url }));
        else if (type === 'favicon') setFormData(prev => ({ ...prev, favicon: data.url }));
        else if (type === 'banner' && index !== null) {
          const newBanners = [...formData.banners];
          newBanners[index].image = data.url;
          setFormData(prev => ({ ...prev, banners: newBanners }));
        }
        toast.success('Đã tải ảnh lên thành công!');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Đã lưu cấu hình hệ thống!');
        fetchSettings();
      }
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    const newBanners = [{ title: 'Tiêu đề Banner mới', subtitle: 'Mô tả ngắn gọn...', image: '', tag: 'MỚI', link: '#products-section' }, ...(formData.banners || [])];
    setFormData({ ...formData, banners: newBanners });
  };

  const updateBanner = (idx, field, value) => {
    const newBanners = [...formData.banners];
    newBanners[idx] = { ...newBanners[idx], [field]: value };
    setFormData({ ...formData, banners: newBanners });
  };

  const removeBanner = (idx) => {
    const newBanners = formData.banners.filter((_, i) => i !== idx);
    setFormData({ ...formData, banners: newBanners });
  };

  const ImageUploader = ({ value, label, onFileSelect, isUploading, onUrlChange, height = '120px' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>{label}</label>
      <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '0.5rem', background: '#fff' }}>
        {value ? (
          <div style={{ position: 'relative', width: '100%', height, borderRadius: '10px', overflow: 'hidden' }}>
            <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer', color: '#fff', fontSize: '0.7rem', fontWeight: 800 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              Đổi ảnh <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
            </label>
          </div>
        ) : (
          <label style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', color: '#94a3b8' }}>
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{isUploading ? 'Đang tải...' : 'Tải ảnh'}</span>
            <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );

  if (!formData) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem', paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isMobile && (
            <Link href="/admin" style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: '#fff', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', textDecoration: 'none'
            }}>
              <ArrowLeft size={20} />
            </Link>
          )}
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#1e293b' }}>Cài đặt</h1>
            <p style={{ color: '#64748b', fontSize: isMobile ? '0.75rem' : '0.85rem' }}>Cấu hình thương hiệu & thông tin web.</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ 
          background: 'var(--gradient)', color: '#fff', 
          padding: isMobile ? '0.7rem 1.5rem' : '0.9rem 2.5rem', 
          borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '0.7rem', 
          boxShadow: '0 8px 25px rgba(212,96,10,0.2)',
          fontSize: isMobile ? '0.85rem' : '1rem'
        }}>
          {saving ? <Loader2 className="animate-spin" size={isMobile ? 16 : 20} /> : <Save size={isMobile ? 16 : 20} />} 
          {isMobile ? 'Lưu' : 'Lưu cấu hình'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Payment Configuration */}
          <section className="admin-section" style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>Thanh toán</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Thông tin QR ngân hàng</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Tên Ngân hàng</label>
                <input type="text" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)', background: '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Số tài khoản</label>
                <input type="text" value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)', background: '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Phí ship mặc định</label>
                <input type="number" value={formData.shippingFee} onChange={(e) => setFormData({ ...formData, shippingFee: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)', background: '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ngưỡng Free ship</label>
                <input type="number" value={formData.freeShippingThreshold} onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)', background: '#f8fafc' }} />
              </div>
              <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Tên chủ tài khoản</label>
                <input type="text" value={formData.bankOwner} onChange={(e) => setFormData({ ...formData, bankOwner: e.target.value })} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-card)', background: '#f8fafc' }} />
              </div>
            </div>
          </section>

        {/* Email Configuration */}
        <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Bell size={22} color="var(--primary)" /> Cấu hình Email
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Tài khoản Gmail gửi mail (SMTP User)</label>
              <input 
                value={formData.smtpUser || ''} 
                onChange={e => setFormData({...formData, smtpUser: e.target.value})} 
                placeholder="Ví dụ: shopvietchi@gmail.com"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }} 
              />
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>Gmail dùng để gửi thông báo cho khách hàng.</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Mật khẩu ứng dụng (SMTP Pass)</label>
              <input 
                type="password"
                value={formData.smtpPass || ''} 
                onChange={e => setFormData({...formData, smtpPass: e.target.value})} 
                placeholder="Nhập mã 16 ký tự mật khẩu ứng dụng"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} 
              />
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem' }}>Mật khẩu ứng dụng tạo từ bảo mật 2 lớp của Google.</p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Email nhận thông báo Admin</label>
              <input 
                value={formData.adminNotificationEmail || ''} 
                onChange={e => setFormData({...formData, adminNotificationEmail: e.target.value})} 
                placeholder="Email của chủ cửa hàng"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} 
              />
            </div>
          </div>
        </section>

        {/* Brand Section */}
        <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Compass size={22} color="var(--primary)" /> Thương hiệu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Tên cửa hàng</label>
              <input value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Slogan SEO</label>
              <input value={formData.siteTitle} onChange={e => setFormData({...formData, siteTitle: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ImageUploader label="Logo chính" value={formData.logo} isUploading={uploading === 'logo'} onFileSelect={file => handleUpload(file, 'logo')} onUrlChange={val => setFormData({...formData, logo: val})} height="100px" />
              <ImageUploader label="Favicon" value={formData.favicon} isUploading={uploading === 'favicon'} onFileSelect={file => handleUpload(file, 'favicon')} onUrlChange={val => setFormData({...formData, favicon: val})} height="100px" />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Phone size={22} color="var(--primary)" /> Liên hệ
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>SĐT (Zalo)</label>
              <input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Email</label>
              <input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Địa chỉ</label>
              <input value={formData.contactAddress} onChange={e => setFormData({...formData, contactAddress: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
          </div>
        </section>
      </div>

      {/* Banner Section */}
      <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>Quản lý Banners</h3>
          <button type="button" onClick={addBanner} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>+ Thêm</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {formData.banners?.map((banner, idx) => (
            <div key={idx} style={{ padding: '1.5rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative' }}>
              <button onClick={() => removeBanner(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                <ImageUploader value={banner.image} isUploading={uploading === idx} onFileSelect={file => handleUpload(file, 'banner', idx)} onUrlChange={val => updateBanner(idx, 'image', val)} height="150px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input value={banner.title} onChange={e => updateBanner(idx, 'title', e.target.value)} placeholder="Tiêu đề banner" style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  <textarea value={banner.subtitle} onChange={e => updateBanner(idx, 'subtitle', e.target.value)} placeholder="Mô tả" rows={3} style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0', resize: 'none' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
