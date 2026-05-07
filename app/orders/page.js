'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Clock, Package, Truck, CheckCircle2, 
  XCircle, ChevronRight, ArrowLeft, ExternalLink, Search,
  Calendar, MapPin, CreditCard
} from 'lucide-react';
import Link from 'next/link';

const StatusBadge = ({ status }) => {
  const configs = {
    'PENDING': { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={12} /> },
    'PROCESSING': { label: 'Đang xử lý', color: '#3b82f6', bg: '#dbeafe', icon: <Package size={12} /> },
    'SHIPPED': { label: 'Đang giao', color: '#8b5cf6', bg: '#ede9fe', icon: <Truck size={12} /> },
    'DELIVERED': { label: 'Đã giao', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle2 size={12} /> },
    'CANCELLED': { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={12} /> }
  };

  const config = configs[status] || configs['PENDING'];

  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.35rem 0.75rem', borderRadius: '99px',
      background: config.bg, color: config.color,
      fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }}>
      {config.icon} {config.label}
    </span>
  );
};

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Lỗi tải đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user, userLoading, router]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();

      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'CANCELLED' } : o));
        alert('Đã hủy đơn hàng thành công');
      } else {
        alert(data.message || 'Lỗi khi hủy đơn');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  if (loading || userLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '3rem 0 6rem' }}>
      <div className="container">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <ShoppingBag size={18} /> TÀI KHOẢN CỦA BẠN
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>Lịch sử đơn hàng</h1>
          </div>
          <button 
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1.5px solid #e2e8f0', padding: '0.75rem 1.25rem', borderRadius: '14px', fontWeight: 700, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </button>
        </header>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', padding: '5rem 2rem', borderRadius: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}
          >
            <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#cbd5e1' }}>
              <ShoppingBag size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>Bạn chưa có đơn hàng nào</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>Hãy khám phá những đặc sản thượng hạng của VietChi và đặt đơn hàng đầu tiên ngay nhé!</p>
            <Link href="/#products-section" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontSize: '1rem' }}>
              Khám phá sản phẩm
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card"
                style={{ overflow: 'hidden', border: '1px solid #f1f5f9' }}
              >
                {/* Order Header */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Mã đơn hàng</div>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>#{order._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Ngày đặt</div>
                      <div style={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Thanh toán</div>
                      <div style={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CreditCard size={14} /> {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt (COD)'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Order Content */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }} className="admin-grid-layout">
                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{item.name}</h4>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{item.quantity} {item.unit || 'kg'} x {item.price?.toLocaleString()}đ</div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#1e293b' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Total */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                          <MapPin size={14} /> ĐỊA CHỈ GIAO HÀNG
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 700, lineHeight: 1.5 }}>
                          {order.shippingAddress.fullName}<br/>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{order.shippingAddress.phone}</span><br/>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{order.shippingAddress.fullAddress || order.shippingAddress.address}</span>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>Tổng thanh toán</span>
                          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Footer Actions */}
                <div style={{ padding: '1rem 1.5rem', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancel(order._id)}
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#fff', border: '1.5px solid #fee2e2', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Yêu cầu hủy
                    </button>
                  )}
                  <Link 
                    href={`/#products-section`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Mua lại sản phẩm <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
