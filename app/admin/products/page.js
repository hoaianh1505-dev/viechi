'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(null); // 'main' or index
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'kg',
    category: 'Đặc sản',
    description: '',
    image: '',
    gallery: []
  });

  const handleUpload = async (file, index = 'main') => {
    if (!file) return;
    setUploading(index);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        if (index === 'main') {
          setFormData(prev => ({ ...prev, image: data.url }));
        } else {
          const newGallery = [...formData.gallery];
          newGallery[index] = data.url;
          setFormData(prev => ({ ...prev, gallery: newGallery }));
        }
        toast.success('Đã tải ảnh lên thành công!');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setUploading(null);
    }
  };

  const ImageUploader = ({ value, label, onFileSelect, isUploading, onUrlChange, onRemove }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>{label}</label>
        {onRemove && (
          <button type="button" onClick={onRemove} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div style={{ 
        border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '1rem', 
        display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' 
      }}>
        {value ? (
          <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <label style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #fff', borderRadius: '8px' }}>
                Đổi ảnh
                <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
              </label>
            </div>
          </div>
        ) : (
          <label style={{ 
            height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
            justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748b' 
          }}>
            {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} />}
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{isUploading ? 'Đang tải...' : 'Bấm để tải ảnh'}</span>
            <input type="file" hidden onChange={e => onFileSelect(e.target.files[0])} />
          </label>
        )}
        <input 
          value={value} 
          onChange={e => onUrlChange(e.target.value)} 
          placeholder="Hoặc dán link ảnh vào đây..." 
          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' }} 
        />
      </div>
    </div>
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Xử lý action=add từ URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      handleOpenModal();
      // Xóa params sau khi mở để không bị lặp lại khi load lại trang
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        ...product, 
        gallery: product.gallery || [] 
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', unit: 'kg', category: 'Đặc sản', description: '', image: '', gallery: [] });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã xóa sản phẩm');
          fetchProducts();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingProduct ? 'Đã cập nhật' : 'Đã thêm thành công');
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (error) {
      toast.error('Lỗi khi lưu');
    }
  };

  const addGalleryImage = () => {
    setFormData({ ...formData, gallery: [...(formData.gallery || []), ''] });
  };

  const updateGalleryImage = (index, value) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = value;
    setFormData({ ...formData, gallery: newGallery });
  };

  const removeGalleryImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: newGallery });
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2rem', paddingBottom: isMobile ? '2rem' : 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 900, color: '#1e293b' }}>Sản phẩm</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{products.length} sản phẩm trong kho</p>
        </div>
        {!isMobile && (
          <button 
            onClick={() => handleOpenModal()}
            style={{ 
              background: 'var(--primary)', color: '#fff', 
              padding: '0.75rem 1.5rem', borderRadius: '14px', 
              border: 'none', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(212,96,10,0.2)'
            }}
          >
            <Plus size={20} /> Thêm sản phẩm
          </button>
        )}
      </header>

      {/* Main Content Area */}
      {isMobile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {products.map((p) => (
            <motion.div 
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: '#fff', padding: '1rem', borderRadius: '24px', 
                border: '1px solid #f1f5f9', display: 'flex', gap: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
              }}
            >
              <img src={p.image} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h3>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary)' }}>{p.price?.toLocaleString()}đ</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(p)} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Edit2 size={14} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(p._id)} style={{ padding: '0.6rem', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>ẢNH</th>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>TÊN SẢN PHẨM</th>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>GIÁ</th>
                <th style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <img src={p.image} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Dùng {p.unit || 'kg'}</div>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{p.price?.toLocaleString()}đ</td>
                  <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleOpenModal(p)} style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ padding: '0.6rem', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'relative', width: '100%', maxWidth: '700px', maxHeight: '90vh', background: '#fff', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
              </div>
              <div style={{ padding: '2rem', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tên sản phẩm</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Giá bán (đ)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đơn vị</label>
                    <input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <ImageUploader 
                      label="Ảnh chính" 
                      value={formData.image} 
                      isUploading={uploading === 'main'}
                      onFileSelect={file => handleUpload(file, 'main')}
                      onUrlChange={val => setFormData({...formData, image: val})}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>Ảnh phụ (Gallery)</label>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, gallery: [...(formData.gallery || []), '']})} 
                        style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        + Thêm ảnh phụ
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {formData.gallery?.map((url, idx) => (
                        <ImageUploader 
                          key={idx}
                          label={`Ảnh phụ ${idx + 1}`}
                          value={url}
                          isUploading={uploading === idx}
                          onFileSelect={file => handleUpload(file, idx)}
                          onUrlChange={val => {
                            const newGallery = [...formData.gallery];
                            newGallery[idx] = val;
                            setFormData({...formData, gallery: newGallery});
                          }}
                          onRemove={() => {
                            const newGallery = formData.gallery.filter((_, i) => i !== idx);
                            setFormData({...formData, gallery: newGallery});
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Mô tả</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', resize: 'none' }} />
                  </div>
                  <button type="submit" style={{ gridColumn: 'span 2', background: 'var(--gradient)', color: '#fff', padding: '1rem', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer', marginTop: '1rem' }}>
                    <Save size={20} /> {editingProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
