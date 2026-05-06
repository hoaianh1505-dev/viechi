'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Image as ImageIcon, MessageSquare, Phone, Globe, Plus, Trash2, 
  Loader2, Star, Link as LinkIcon, MapPin, Clock, Bell, Info, Compass, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/context/SettingsContext';

// Custom Social Icons to avoid lucide-react missing export errors
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>Cấu hình hệ thống</h1>
          <p style={{ color: '#64748b' }}>Đồng nhất toàn bộ thương hiệu và trải nghiệm người dùng.</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background: 'var(--gradient)', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.7rem', boxShadow: '0 8px 25px rgba(212,96,10,0.2)' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Lưu cấu hình
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Brand Section */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Compass size={22} color="var(--primary)" /> Nhận diện thương hiệu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Tên cửa hàng</label>
              <input value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Slogan / Tiêu đề SEO</label>
              <input value={formData.siteTitle} onChange={e => setFormData({...formData, siteTitle: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <ImageUploader label="Logo chính" value={formData.logo} isUploading={uploading === 'logo'} onFileSelect={file => handleUpload(file, 'logo')} onUrlChange={val => setFormData({...formData, logo: val})} height="110px" />
              <ImageUploader label="Favicon (Tab)" value={formData.favicon} isUploading={uploading === 'favicon'} onFileSelect={file => handleUpload(file, 'favicon')} onUrlChange={val => setFormData({...formData, favicon: val})} height="110px" />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Phone size={22} color="var(--primary)" /> Liên hệ & Địa chỉ
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>SĐT (Zalo)</label>
              <input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Email</label>
              <input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Địa chỉ cửa hàng</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0 0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9' }}>
                <MapPin size={16} color="#94a3b8" />
                <input value={formData.contactAddress} onChange={e => setFormData({...formData, contactAddress: e.target.value})} style={{ flex: 1, padding: '0.75rem 0', border: 'none', background: 'none', outline: 'none' }} />
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Google Maps Link (Dán mã nhúng hoặc Link)</label>
              <input value={formData.googleMapsLink} onChange={e => setFormData({...formData, googleMapsLink: e.target.value})} placeholder="https://www.google.com/maps/embed?..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
               <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Giờ làm việc</label>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0 0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9' }}>
                <Clock size={16} color="#94a3b8" />
                <input value={formData.workingHours} onChange={e => setFormData({...formData, workingHours: e.target.value})} style={{ flex: 1, padding: '0.75rem 0', border: 'none', background: 'none', outline: 'none' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Marketing & Announcement */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
              <Bell size={22} color="var(--primary)" /> Thanh thông báo (Banner Top)
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input type="checkbox" checked={formData.announcementActive} onChange={e => setFormData({...formData, announcementActive: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Kích hoạt</span>
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Nội dung thông báo (Ví dụ: Miễn phí vận chuyển...)</label>
             <textarea value={formData.announcementText} onChange={e => setFormData({...formData, announcementText: e.target.value})} rows={2} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', resize: 'none' }} />
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
               <MessageSquare size={20} color="var(--primary)" /> AI & Câu chuyện
             </h3>
             <textarea value={formData.brandStory} onChange={e => setFormData({...formData, brandStory: e.target.value})} placeholder="Nhập câu chuyện thương hiệu để AI hiểu và tư vấn khách hàng tốt hơn..." rows={4} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', resize: 'none' }} />
          </div>
        </section>

        {/* Social Links */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
            <Compass size={22} color="var(--primary)" /> Kết nối Mạng xã hội
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
               <FacebookIcon size={18} />
               <input value={formData.socialFacebook} onChange={e => setFormData({...formData, socialFacebook: e.target.value})} placeholder="Link Facebook Page..." style={{ flex: 1, padding: '0.8rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
               <InstagramIcon size={18} />
               <input value={formData.socialInstagram} onChange={e => setFormData({...formData, socialInstagram: e.target.value})} placeholder="Link Instagram..." style={{ flex: 1, padding: '0.8rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
               <YoutubeIcon size={18} />
               <input value={formData.socialYoutube} onChange={e => setFormData({...formData, socialYoutube: e.target.value})} placeholder="Link Youtube Channel..." style={{ flex: 1, padding: '0.8rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
               <TikTokIcon size={18} />
               <input value={formData.socialTiktok} onChange={e => setFormData({...formData, socialTiktok: e.target.value})} placeholder="Link TikTok..." style={{ flex: 1, padding: '0.8rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '0.85rem' }} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Dòng chữ Footer</label>
             <input value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
          </div>
        </section>
      </div>

      {/* Banner Visual CRUD Section */}
      <section style={{ background: '#fff', padding: '3rem', borderRadius: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#1e293b' }}>
              <Layout size={28} color="var(--primary)" /> Quản lý Banners Trực quan
            </h3>
            <p style={{ color: '#64748b' }}>Thêm mới, xóa và tùy chỉnh Banners hiển thị ngoài trang chủ.</p>
          </div>
          <button type="button" onClick={addBanner} style={{ padding: '1rem 2rem', borderRadius: '18px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 10px 30px rgba(212,96,10,0.3)' }}>
            <Plus size={24} /> Thêm Banner mới
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {formData.banners?.map((banner, idx) => (
            <motion.div layout key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', padding: '2.5rem', borderRadius: '36px', background: '#f8fafc', border: '1.5px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '3rem', boxShadow: '0 15px 45px rgba(0,0,0,0.03)' }}>
              <button onClick={() => removeBanner(idx)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '42px', height: '42px', borderRadius: '14px', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(239,68,68,0.15)' }} title="Xóa Banner"><Trash2 size={22} /></button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Hình ảnh & Link</p>
                 <ImageUploader value={banner.image} isUploading={uploading === idx} onFileSelect={file => handleUpload(file, 'banner', idx)} onUrlChange={val => updateBanner(idx, 'image', val)} height="240px" />
                 <div style={{ padding: '0.9rem 1.2rem', background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <LinkIcon size={16} color="var(--primary)" />
                    <input value={banner.link} onChange={e => updateBanner(idx, 'link', e.target.value)} placeholder="#products-section" style={{ flex: 1, border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }} />
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <p style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Nội dung chi tiết</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fff', padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                    <Star size={18} color="var(--primary)" fill="var(--primary)" />
                    <input value={banner.tag} onChange={e => updateBanner(idx, 'tag', e.target.value)} placeholder="TAG (Ví dụ: KHUYẾN MÃI)" style={{ border: 'none', background: 'none', fontWeight: 900, fontSize: '0.9rem', width: '100%', outline: 'none', color: 'var(--primary)' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tiêu đề chính (Header)</label>
                    <input value={banner.title} onChange={e => updateBanner(idx, 'title', e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 900, fontSize: '1.3rem', color: '#1e293b' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Mô tả ngắn (Subtitle)</label>
                    <textarea value={banner.subtitle} onChange={e => updateBanner(idx, 'subtitle', e.target.value)} rows={4} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#64748b', resize: 'none', lineHeight: 1.5 }} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Save Banners Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ 
              background: 'var(--gradient)', color: '#fff', 
              padding: '1rem 3rem', borderRadius: '18px', 
              border: 'none', fontWeight: 900, fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem',
              boxShadow: '0 10px 30px rgba(212,96,10,0.25)',
              transition: 'all 0.2s'
            }}
          >
            {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            Lưu Banners
          </button>
        </div>
      </section>
    </div>
  );
}
