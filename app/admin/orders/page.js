'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success('Đã cập nhật trạng thái');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật');
    }
  };

  const deleteOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa đơn hàng?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa vĩnh viễn',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Đã xóa đơn hàng');
          fetchOrders();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Quản lý Đơn hàng</h1>
          <p style={{ color: '#64748b' }}>Theo dõi và xử lý các đơn hàng từ khách.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', padding: '0.4rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', 
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                background: filter === s ? 'var(--primary)' : 'transparent',
                color: filter === s ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredOrders.map((order) => (
          <motion.div 
            layout key={order._id}
            style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Đơn hàng #{order._id.slice(-6).toUpperCase()}</h3>
                  <span style={{ 
                    padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                    background: order.status === 'pending' ? '#fff7e6' : order.status === 'delivered' ? '#f6ffed' : '#f1f5f9',
                    color: order.status === 'pending' ? '#d46b08' : order.status === 'delivered' ? '#389e0d' : '#475569'
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(order.createdAt).toLocaleString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShoppingBag size={14} /> {order.items.length} sản phẩm</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }}
                >
                  <option value="pending">CHỜ DUYỆT</option>
                  <option value="processing">ĐANG XỬ LÝ</option>
                  <option value="shipped">ĐANG GIAO</option>
                  <option value="delivered">ĐÃ GIAO</option>
                  <option value="cancelled">ĐÃ HỦY</option>
                </select>
                <button onClick={() => deleteOrder(order._id)} style={{ padding: '0.6rem', borderRadius: '12px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Danh sách sản phẩm</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>x {item.quantity}{item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Thông tin khách hàng</h4>
                <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>{order.shippingInfo?.fullName}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>{order.shippingInfo?.phone}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>{order.shippingInfo?.address}</p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#64748b' }}>Tổng thanh toán</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Không có đơn hàng nào trong mục này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
