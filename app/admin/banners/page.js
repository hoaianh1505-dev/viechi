'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Loader2, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: '',
    image: '',
    link: '#products-section',
    order: 0,
    active: true
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Tải ảnh lên thành công!');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', tag: '', image: '', link: '#products-section', order: banners.length, active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingBanner ? 'PUT' : 'POST';
    const url = editingBanner ? `/api/admin/banners/${editingBanner._id}` : '/api/admin/banners';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingBanner ? 'Đã cập nhật' : 'Đã thêm banner');
        setIsModalOpen(false);
        fetchBanners();
      }
    } catch (error) {
      toast.error('Lỗi khi lưu banner');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa banner?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã xóa banner');
          fetchBanners();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const ImageUploader = ({ value, label, onFileSelect, isUploading, onUrlChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>{label}</label>
      <div style={{ 
        border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '1rem', 
        display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' 
      }}>
        {value ? (
          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer', color: '#fff', fontWeight: 800 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              Đổi ảnh
              <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
            </label>
          </div>
        ) : (
          <label style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748b' }}>
            {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={32} />}
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{isUploading ? 'Đang tải...' : 'Bấm để tải ảnh'}</span>
            <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
          </label>
        )}
        <input value={value} onChange={e => onUrlChange(e.target.value)} placeholder="Hoặc dán link ảnh vào đây..." style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Quản lý Banners</h1>
          <p style={{ color: '#64748b' }}>Banners giờ đã độc lập như sản phẩm, dễ dàng thêm sửa xóa.</p>
        </div>
        <button onClick={() => handleOpenModal()} style={{ background: 'var(--primary)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Thêm Banner
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {banners.map(banner => (
            <motion.div layout key={banner._id} style={{ background: '#fff', borderRadius: '24px', border: '1.5px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', position: 'relative' }}>
                <img src={banner.image || 'https://placehold.co/600x400?text=No+Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(banner)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#fff', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(banner._id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><Trash2 size={16} /></button>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'var(--primary)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                  Thứ tự: {banner.order}
                </div>
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>{banner.tag}</div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{banner.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>{banner.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'relative', width: '100%', maxWidth: '850px', maxHeight: '90vh', background: '#fff', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{editingBanner ? 'Sửa Banner' : 'Thêm Banner mới'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <div style={{ padding: '2rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                {/* Left Side: Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Tiêu đề chính</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Thẻ (Tag)</label>
                      <input value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Thứ tự hiển thị</label>
                      <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Mô tả ngắn</label>
                    <textarea value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', resize: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Link nút bấm</label>
                    <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="#products-section" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                  </div>
                  <ImageUploader label="Ảnh Banner" value={formData.image} isUploading={uploading} onFileSelect={handleUpload} onUrlChange={val => setFormData({...formData, image: val})} />
                  <button type="submit" style={{ background: 'var(--gradient)', color: '#fff', padding: '1.2rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 8px 20px rgba(212,96,10,0.2)' }}>
                    <Save size={20} /> {editingBanner ? 'Lưu thay đổi' : 'Tạo Banner'}
                  </button>
                </form>

                {/* Right Side: LIVE PREVIEW */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>Live Preview (Bản xem thực tế)</label>
                  <div style={{ 
                    width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', 
                    background: 'linear-gradient(135deg, #fff3ea 0%, #ffffff 100%)',
                    border: '1px solid #ffe2cc', display: 'grid', gridTemplateColumns: formData.image ? '1fr' : '1fr',
                    alignItems: 'center', padding: '1.5rem', position: 'relative',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: formData.image ? 'flex-start' : 'center', textAlign: formData.image ? 'left' : 'center' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.6rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={10} fill="var(--primary)" /> {formData.tag || 'TAG'}
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', lineHeight: 1.1, marginBottom: '0.6rem' }}>
                        {formData.title || 'Tiêu đề'}
                      </h2>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
                        {formData.subtitle || 'Mô tả ngắn...'}
                      </p>
                      <div style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>
                        Mua Ngay
                      </div>
                    </div>
                    {formData.image && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                        <img src={formData.image} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '15px', border: '3px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
