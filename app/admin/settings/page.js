'use client';

import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, MessageSquare, Phone, MapPin, Mail, Globe, Info, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/context/SettingsContext';

export default function AdminSettings() {
  const { settings, fetchSettings, updateSettingsLocally } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
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
    const newBanners = [...(formData.banners || []), { title: '', subtitle: '', image: '', tag: '', link: '/shop' }];
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Cấu hình hệ thống</h1>
          <p style={{ color: '#64748b' }}>Tùy chỉnh thương hiệu, banners và AI advisor.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            background: 'var(--gradient)', color: '#fff', 
            padding: '0.8rem 2rem', borderRadius: '14px', 
            border: 'none', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            boxShadow: '0 8px 20px rgba(212,96,10,0.2)'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Lưu thay đổi
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Brand Section */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Globe size={20} color="var(--primary)" /> Thông tin thương hiệu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tên cửa hàng</label>
              <input value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Slogan / Tiêu đề web</label>
              <input value={formData.siteTitle} onChange={e => setFormData({...formData, siteTitle: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Logo URL</label>
              <input value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="Dán link logo..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section style={{ background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Phone size={20} color="var(--primary)" /> Thông tin liên hệ
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Số điện thoại (Zalo)</label>
              <input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Địa chỉ hiển thị</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc' }} />
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section style={{ gridColumn: 'span 2', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageSquare size={20} color="var(--primary)" /> Cấu hình AI Advisor
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Câu chuyện thương hiệu (Giúp AI hiểu bạn)</label>
              <textarea value={formData.brandStory} onChange={e => setFormData({...formData, brandStory: e.target.value})} rows={6} placeholder="Ví dụ: VietChi là cửa hàng đặc sản chuyên cung cấp..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', resize: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Chỉ dẫn AI (System Role)</label>
              <textarea value={formData.aiRole} onChange={e => setFormData({...formData, aiRole: e.target.value})} rows={6} placeholder="Ví dụ: Bạn là trợ lý bán hàng vui vẻ, tư vấn ngắn gọn..." style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #f1f5f9', background: '#f8fafc', resize: 'none' }} />
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section style={{ gridColumn: 'span 2', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ImageIcon size={20} color="var(--primary)" /> Quản lý Banners trang chủ
            </h3>
            <button type="button" onClick={addBanner} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+ Thêm Banner</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {formData.banners?.map((banner, idx) => (
              <div key={idx} style={{ padding: '1.5rem', borderRadius: '20px', border: '1.5px solid #f1f5f9', position: 'relative' }}>
                <button onClick={() => removeBanner(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Tiêu đề chính</label>
                    <input value={banner.title} onChange={e => updateBanner(idx, 'title', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Tiêu đề phụ</label>
                    <input value={banner.subtitle} onChange={e => updateBanner(idx, 'subtitle', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Thẻ (Tag)</label>
                    <input value={banner.tag} onChange={e => updateBanner(idx, 'tag', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Ảnh Banner (URL)</label>
                    <input value={banner.image} onChange={e => updateBanner(idx, 'image', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Đường dẫn (Link)</label>
                    <input value={banner.link} onChange={e => updateBanner(idx, 'link', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
