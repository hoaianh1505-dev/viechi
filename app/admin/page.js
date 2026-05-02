'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import { useUser } from '@/context/UserContext';
import { Plus, Edit2, Trash2, X, Save, Upload, ImageOff, Package, LayoutDashboard, Fish, ShoppingBag, Truck, CheckCircle, Clock, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

// ===== Upload functions (Server side API) =====
const uploadToServer = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload thất bại');
  const data = await res.json();
  return data.url;
};

// ===== ImageUploader component =====
const ImageUploader = ({ value, onChange, label = 'Ảnh chính', required = false }) => {
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadToServer(file);
      onChange(url);
    } catch (err) {
      alert('Lỗi upload: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.45rem' }}>{label} {required && '*'}</label>
      <div onClick={() => inputRef.current.click()} style={{ border: `2px dashed ${value ? 'var(--primary)' : 'var(--border-card)'}`, borderRadius: '12px', cursor: 'pointer', overflow: 'hidden', background: value ? 'var(--primary-light)' : 'var(--bg-section)', transition: 'all 0.2s', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {loading ? <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Đang xử lý...</span> : value ? <><img src={value} alt="preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}><span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Upload size={16} /> Đổi ảnh</span></div></> : <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}><Upload size={28} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} /><p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Bấm để chọn ảnh</p></div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
};

// ===== PRODUCT MODAL =====
const ProductModal = ({ editing, onClose, onSave }) => {
  const [form, setForm] = useState(editing || { name: '', price: '', description: '', image: '', gallery: [], category: '', unit: 'kg' });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSubmit = e => { e.preventDefault(); onSave({ ...form, price: Number(form.price) }); };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,6,0.45)', backdropFilter: 'blur(6px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 18 }} className="card" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input required value={form.name} onChange={e => f('name', e.target.value)} className="input" placeholder="Tên sản phẩm *" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
            <input required type="number" value={form.price} onChange={e => f('price', e.target.value)} className="input" placeholder="Giá (VNĐ) *" />
            <select value={form.unit || 'kg'} onChange={e => f('unit', e.target.value)} className="input" style={{ background: '#fff' }}>
              <option value="kg">kg</option><option value="lít">lít</option><option value="con">con</option><option value="gói">gói</option><option value="hộp">hộp</option>
            </select>
            <input value={form.category} onChange={e => f('category', e.target.value)} className="input" placeholder="Danh mục" />
          </div>
          <textarea rows={3} value={form.description} onChange={e => f('description', e.target.value)} className="input" placeholder="Mô tả..." />
          <ImageUploader label="Ảnh chính" required value={form.image} onChange={v => f('image', v)} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}><Save size={16} /> Lưu</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ===== MAIN DASHBOARD =====
export default function AdminDashboard() {
  const { products, banners, addProduct, updateProduct, deleteProduct, getId, loading: productLoading } = useProducts();
  const { user, isAdmin, loading: authLoading } = useUser();
  const [tab, setTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [shippingFees, setShippingFees] = useState([]);
  const [apiProvinces, setApiProvinces] = useState([]); // Provinces from API
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newFee, setNewFee] = useState({ province: '', fee: '' });
  const router = useRouter();

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
    if (tab === 'shipping') {
      fetchShipping();
      fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then(data => {
          setApiProvinces(data);
          if (data.length > 0) setNewFee(prev => ({ ...prev, province: data[0].name }));
        });
    }
  }, [tab]);

  const fetchOrders = () => fetch('/api/orders').then(res => res.json()).then(data => setOrders(Array.isArray(data) ? data : []));
  const fetchShipping = () => fetch('/api/shipping').then(res => res.json()).then(data => setShippingFees(Array.isArray(data) ? data : []));

  // Redirect if not admin after loading
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [authLoading, user, isAdmin, router]);

  if (authLoading || productLoading) return <div style={{ padding: '8rem', textAlign: 'center' }}>Đang tải...</div>;
  if (!isAdmin) return null;

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        toast.success('Đã cập nhật trạng thái!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Lỗi cập nhật');
      }
    } catch (e) {
      toast.error('Lỗi kết nối server');
    }
  };

  const deleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Đơn hàng sẽ bị xóa vĩnh viễn khỏi hệ thống!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
        if (res.ok) {
          setOrders(orders.filter(o => o._id !== orderId));
          toast.success('Đã xóa đơn hàng thành công');
        }
      } catch (e) {
        toast.error('Lỗi xóa đơn hàng');
      }
    }
  };

  const handleSaveShipping = async () => {
    if (!newFee.fee || !newFee.province) return;
    const res = await fetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFee)
    });
    if (res.ok) {
      fetchShipping();
      setNewFee({ ...newFee, fee: '' });
      toast.success('Đã cập nhật phí ship!');
    }
  };

  const deleteShippingFee = async (feeId) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa phí ship?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/shipping/${feeId}`, { method: 'DELETE' });
        if (res.ok) {
          setShippingFees(shippingFees.filter(f => f._id !== feeId));
          toast.success('Đã xóa phí ship');
        }
      } catch (e) {
        toast.error('Lỗi xóa phí ship');
      }
    }
  };

  const TABS = [
    { key: 'products', label: 'Sản phẩm', icon: Package, count: products.length },
    { key: 'orders',   label: 'Đơn hàng',  icon: ShoppingBag, count: orders.length },
    { key: 'shipping', label: 'Phí ship',  icon: Truck,    count: shippingFees.length },
  ];

  return (
    <div style={{ background: 'var(--bg-section)', minHeight: '90vh', padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', background: tab === t.key ? 'var(--gradient)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-muted)' }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}><button className="btn btn-primary" onClick={() => { setEditingProduct(null); setShowProductModal(true); }}><Plus size={17} /> Thêm sản phẩm</button></div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-container"><table>
                <thead style={{ background: 'var(--bg-section)' }}><tr><th>Sản phẩm</th><th>Giá/Đơn vị</th><th style={{ textAlign: 'right' }}>Thao tác</th></tr></thead>
                <tbody>{products.map(p => (
                  <tr key={getId(p)}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><img src={p.image} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} /> <span style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{p.price.toLocaleString()}đ/{p.unit || 'kg'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="btn btn-ghost" style={{ padding: '0.4rem' }}><Edit2 size={15} /></button> 
                      <button onClick={async () => {
                        const res = await Swal.fire({
                          title: 'Xóa sản phẩm?',
                          text: `Bạn có chắc muốn xóa ${p.name}?`,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          confirmButtonText: 'Xóa ngay',
                          cancelButtonText: 'Hủy'
                        });
                        if (res.isConfirmed) deleteProduct(getId(p));
                      }} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--red)' }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Đơn hàng #{order._id.slice(-6).toUpperCase()}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <select 
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="input"
                    style={{ 
                      width: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: '8px',
                      background: order.status === 'pending' ? '#fff7e6' : order.status === 'processing' ? '#e6f7ff' : order.status === 'shipped' ? '#f9f0ff' : order.status === 'delivered' ? '#f6ffed' : '#fff1f0',
                      color: order.status === 'pending' ? '#d46b08' : order.status === 'processing' ? '#096dd9' : order.status === 'shipped' ? '#722ed1' : order.status === 'delivered' ? '#389e0d' : '#cf1322',
                      border: 'none'
                    }}
                  >
                    <option value="pending">CHỜ DUYỆT</option>
                    <option value="processing">ĐANG XỬ LÝ</option>
                    <option value="shipped">ĐANG GIAO</option>
                    <option value="delivered">ĐÃ GIAO</option>
                    <option value="cancelled">ĐÃ HỦY</option>
                  </select>
                  <button onClick={() => deleteOrder(order._id)} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--red)' }} title="Xóa đơn hàng">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Sản phẩm:</p>
                    {order.items.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>- {it.name} x {it.quantity}{it.unit}</div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Người nhận: **{order.shippingInfo?.fullName}**</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Địa chỉ: {order.shippingInfo?.address}</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.5rem' }}>{order.totalAmount?.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'shipping' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Thiết lập phí ship</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select className="input" value={newFee.province} onChange={e => setNewFee({ ...newFee, province: e.target.value })} style={{ background: '#fff' }}>
                  <option value="">Chọn Tỉnh thành</option>
                  {apiProvinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                </select>
                <input type="number" className="input" placeholder="Phí ship (VNĐ)" value={newFee.fee} onChange={e => setNewFee({ ...newFee, fee: e.target.value })} />
                <button onClick={handleSaveShipping} className="btn btn-primary" style={{ width: '100%' }}><Save size={16} /> Lưu phí ship</button>
              </div>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="table-container"><table>
                <thead style={{ background: 'var(--bg-section)' }}><tr><th>Tỉnh/Thành</th><th>Phí ship</th><th style={{ textAlign: 'right' }}>Thao tác</th></tr></thead>
                <tbody>{shippingFees.map(f => (
                  <tr key={f._id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} color="var(--primary)" /> {f.province}</div></td>
                    <td style={{ fontWeight: 800 }}>{f.fee.toLocaleString()}đ</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteShippingFee(f._id)} className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--red)' }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProductModal && <ProductModal editing={editingProduct} onClose={() => setShowProductModal(false)} onSave={(d) => { if (editingProduct) updateProduct(getId(editingProduct), d); else addProduct(d); setShowProductModal(false); }} />}
      </AnimatePresence>
    </div>
  );
}
