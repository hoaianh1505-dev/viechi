'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { Plus, Edit2, Trash2, X, Save, Upload, ImageOff, Package, LayoutDashboard, Fish } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== Upload image to server =====
const uploadToServer = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload thất bại');
  const data = await res.json();
  return data.url; // e.g. "/images/1234567890.jpg"
};

const uploadMultipleToServer = async (files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  const res = await fetch('/api/upload/multiple', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload thất bại');
  const data = await res.json();
  return data.urls;
};

// ===== ImageUploader component =====
const ImageUploader = ({ value, onChange, label = 'Ảnh chính', required = false }) => {
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError('');
    try {
      const url = await uploadToServer(file);
      onChange(url);
    } catch (err) {
      setError('Lỗi upload: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.45rem' }}>
        {label} {required && '*'}
      </label>
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${value ? 'var(--primary)' : 'var(--border-card)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          overflow: 'hidden',
          background: value ? 'var(--primary-light)' : 'var(--bg-section)',
          transition: 'all 0.2s',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = value ? 'var(--primary)' : 'var(--border-card)'}
      >
        {loading ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang xử lý...</span>
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
              onError={e => e.target.style.display = 'none'}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Upload size={16} /> Đổi ảnh
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            <Upload size={28} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Bấm để chọn ảnh</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>JPG, PNG, WEBP · Tự động nén</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
};

// ===== MultiImageUploader =====
const MultiImageUploader = ({ value = [], onChange, label = 'Ảnh phụ' }) => {
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setLoading(true);
    try {
      const urls = await uploadMultipleToServer(files);
      onChange([...value, ...urls]);
    } catch (err) {
      alert('Lỗi upload: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.45rem' }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.6rem' }}>
        {value.map((img, i) => (
          <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--border-card)' }} />
            <button
              type="button"
              onClick={() => remove(i)}
              style={{
                position: 'absolute', top: '-6px', right: '-6px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'var(--red)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          style={{
            width: '80px', height: '80px', borderRadius: '8px',
            border: '2px dashed var(--border-card)', background: 'var(--bg-section)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            fontSize: '0.7rem', gap: '0.25rem',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
        >
          {loading ? '...' : <><Plus size={18} /><span>Thêm</span></>}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  );
};

// ===== PRODUCT MODAL =====
const ProductModal = ({ editing, onClose, onSave }) => {
  const [form, setForm] = useState(editing || { name: '', price: '', description: '', image: '', gallery: [], category: '' });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), gallery: Array.isArray(form.gallery) ? form.gallery : [] });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,6,0.45)', backdropFilter: 'blur(6px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 18 }}
        className="card"
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Tên sản phẩm *</label>
            <input required value={form.name} onChange={e => f('name', e.target.value)} className="input" placeholder="VD: Khô cá dứa một nắng" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Giá (VNĐ) *</label>
              <input required type="number" value={form.price} onChange={e => f('price', e.target.value)} className="input" placeholder="180000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Danh mục</label>
              <input value={form.category} onChange={e => f('category', e.target.value)} className="input" placeholder="Khô cá" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Mô tả</label>
            <textarea rows={3} value={form.description} onChange={e => f('description', e.target.value)} className="input" style={{ resize: 'vertical' }} placeholder="Mô tả chi tiết về sản phẩm..." />
          </div>

          <ImageUploader label="Ảnh chính" required value={form.image} onChange={v => f('image', v)} />
          <MultiImageUploader label="Ảnh phụ (gallery)" value={Array.isArray(form.gallery) ? form.gallery : []} onChange={v => f('gallery', v)} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              <Save size={16} /> {editing ? 'Cập nhật' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ===== BANNER MODAL =====
const BannerModal = ({ editing, onClose, onSave }) => {
  const [form, setForm] = useState(editing || { title: '', subtitle: '', tag: '', image: '' });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,6,0.45)', backdropFilter: 'blur(6px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 18 }}
        className="card"
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{editing ? 'Sửa banner' : 'Thêm banner mới'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Tiêu đề *</label>
            <input required value={form.title} onChange={e => f('title', e.target.value)} className="input" placeholder="VD: Khô Cá Dứa Một Nắng" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Tag / Nhãn</label>
            <input value={form.tag} onChange={e => f('tag', e.target.value)} className="input" placeholder="VD: Flash Sale, Free Ship..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>Mô tả ngắn</label>
            <textarea rows={3} value={form.subtitle} onChange={e => f('subtitle', e.target.value)} className="input" style={{ resize: 'vertical' }} placeholder="Nội dung ưu đãi..." />
          </div>

          <ImageUploader label="Ảnh banner" value={form.image} onChange={v => f('image', v)} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              <Save size={16} /> {editing ? 'Cập nhật' : 'Thêm banner'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ===== MAIN DASHBOARD =====
export default function AdminDashboard() {
  const { products, banners, isAdmin, addProduct, updateProduct, deleteProduct, addBanner, updateBanner, deleteBanner, getId, loading, serverOnline } = useProducts();
  const [tab, setTab] = useState('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Đang kết nối cơ sở dữ liệu...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleSaveProduct = (data) => {
    if (editingProduct) updateProduct(getId(editingProduct), data);
    else addProduct(data);
    setShowProductModal(false); setEditingProduct(null);
  };

  const handleSaveBanner = (data) => {
    if (editingBanner) updateBanner(getId(editingBanner), data);
    else addBanner(data);
    setShowBannerModal(false); setEditingBanner(null);
  };

  const TABS = [
    { key: 'products', label: 'Sản phẩm', icon: Package, count: products.length },
    { key: 'banners',  label: 'Banner',    icon: Fish,    count: banners.length },
  ];

  return (
    <div style={{ background: 'var(--bg-section)', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <LayoutDashboard size={20} style={{ color: 'var(--primary)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản trị cửa hàng</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
              {products.length} sản phẩm · {banners.length} banner
            </p>
          </div>

          {/* Connection Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.85rem', borderRadius: '10px',
            background: serverOnline ? '#f0fdf4' : '#fff1f0',
            border: `1px solid ${serverOnline ? '#86efac' : '#fecaca'}`,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: serverOnline ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: serverOnline ? '#16a34a' : '#b91c1c' }}>
              {serverOnline ? 'MONGODB: ĐÃ KẾT NỐI' : 'CHẾ ĐỘ LƯU TẠM (OFFLINE)'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-card)', width: 'fit-content' }}>
          {TABS.map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1.1rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '0.86rem',
                background: tab === key ? 'var(--gradient)' : 'transparent',
                color: tab === key ? '#fff' : 'var(--text-muted)',
                boxShadow: tab === key ? '0 2px 8px rgba(212,96,10,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
              <Icon size={15} /> {label}
              <span style={{
                background: tab === key ? 'rgba(255,255,255,0.25)' : 'var(--bg-section)',
                color: tab === key ? '#fff' : 'var(--text-muted)',
                borderRadius: '999px', padding: '0 6px', fontSize: '0.72rem', fontWeight: 800,
              }}>{count}</span>
            </button>
          ))}
        </div>

        {/* --- PRODUCTS --- */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
                <Plus size={17} /> Thêm sản phẩm
              </button>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table>
                <thead style={{ background: 'var(--bg-section)' }}>
                  <tr><th style={{ textAlign: 'left' }}>Sản phẩm</th><th style={{ textAlign: 'left' }}>Danh mục</th><th style={{ textAlign: 'left' }}>Giá</th><th style={{ textAlign: 'right' }}>Thao tác</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={getId(p)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {p.image
                            ? <img src={p.image} alt="" style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-card)' }} onError={e => e.target.style.display='none'} />
                            : <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageOff size={18} style={{ color: 'var(--text-dim)' }} /></div>
                          }
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-accent">{p.category}</span></td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{p.price.toLocaleString('vi-VN')}đ</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                            style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Edit2 size={13} /> Sửa
                          </button>
                          <button onClick={() => window.confirm('Xóa sản phẩm này?') && deleteProduct(getId(p))}
                            style={{ background: '#fff1f0', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sản phẩm nào.</div>}
            </div>
          </div>
        )}

        {/* --- BANNERS --- */}
        {tab === 'banners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-primary" onClick={() => { setEditingBanner(null); setShowBannerModal(true); }}>
                <Plus size={17} /> Thêm banner
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {banners.map((b, i) => (
                <motion.div key={getId(b)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', padding: '1rem 1.25rem' }}>
                  <div style={{ width: '100px', height: '65px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-section)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {b.image
                      ? <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      : <ImageOff size={22} style={{ color: 'var(--text-dim)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      {b.tag && <span className="badge badge-primary">{b.tag}</span>}
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subtitle}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => { setEditingBanner(b); setShowBannerModal(true); }}
                      style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Edit2 size={13} /> Sửa
                    </button>
                    <button onClick={() => window.confirm('Xóa banner này?') && deleteBanner(getId(b))}
                      style={{ background: '#fff1f0', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Trash2 size={13} /> Xóa
                    </button>
                  </div>
                </motion.div>
              ))}
              {banners.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', border: '1.5px dashed var(--border-card)', borderRadius: '16px', background: '#fff' }}>
                  Chưa có banner nào. Nhấn "Thêm banner" để tạo mới.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProductModal && <ProductModal editing={editingProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); }} onSave={handleSaveProduct} />}
        {showBannerModal && <BannerModal editing={editingBanner} onClose={() => { setShowBannerModal(false); setEditingBanner(null); }} onSave={handleSaveBanner} />}
      </AnimatePresence>
    </div>
  );
}
