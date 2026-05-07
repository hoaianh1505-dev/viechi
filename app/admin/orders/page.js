'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, Filter, Eye, Phone, MapPin, 
  ChevronRight, Calendar, User, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      toast.error('Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Cập nhật trạng thái: ${newStatus}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      toast.error('Lỗi cập nhật');
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7', icon: Clock };
      case 'PROCESSING': return { label: 'Đang chuẩn bị', color: '#2563eb', bg: '#eff6ff', icon: Package };
      case 'SHIPPED': return { label: 'Đang giao', color: '#7c3aed', bg: '#f5f3ff', icon: Truck };
      case 'DELIVERED': return { label: 'Đã giao', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2', icon: XCircle };
      default: return { label: status, color: '#64748b', bg: '#f1f5f9', icon: Clock };
    }
  };

  const Package = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );

  const ArrowLeft = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );

  return (
    <div style={{ padding: isMobile ? '1rem' : '2rem', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: isMobile ? '1.5rem' : '2.5rem',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isMobile && (
            <Link href="/admin" style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: '#fff', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', textDecoration: 'none'
            }}>
              <ArrowLeft size={20} color="#64748b" />
            </Link>
          )}
          <div>
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingBag size={isMobile ? 24 : 32} color="var(--primary)" /> Đơn hàng
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: isMobile ? '0.85rem' : '1rem' }}>Quản lý các giao dịch từ khách hàng</p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          overflowX: 'auto', 
          width: isMobile ? '100%' : 'auto',
          paddingBottom: isMobile ? '0.5rem' : '0',
          scrollbarWidth: 'none'
        }}>
          {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.6rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: filterStatus === s ? 'var(--text-main)' : '#fff',
                color: filterStatus === s ? '#fff' : '#64748b',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {s === 'ALL' ? 'Tất cả' : getStatusInfo(s).label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Đang tải dữ liệu...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: (selectedOrder && !isMobile) ? '1fr 400px' : '1fr', 
          gap: '2rem' 
        }}>
          
          {/* Orders List Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isMobile ? (
              // Mobile Card Layout
              filteredOrders.map(order => {
                const status = getStatusInfo(order.status);
                return (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      background: '#fff', padding: '1.25rem', borderRadius: '20px',
                      border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '999px', background: status.bg, color: status.color, fontSize: '0.7rem', fontWeight: 800 }}>
                        <status.icon size={10} /> {status.label}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginBottom: '0.25rem' }}>{order.shippingAddress.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')} • {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'COD'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed #f1f5f9' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{order.items.length} sản phẩm</span>
                      <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.1rem' }}>{order.totalAmount.toLocaleString()}đ</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Desktop Table Layout
              <div style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>MÃ ĐƠN</th>
                      <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>KHÁCH HÀNG</th>
                      <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>NGÀY ĐẶT</th>
                      <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>THANH TOÁN</th>
                      <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>TRẠNG THÁI</th>
                      <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>TỔNG TIỀN</th>
                      <th style={{ padding: '1.25rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const status = getStatusInfo(order.status);
                      return (
                        <tr key={order._id} 
                          onClick={() => setSelectedOrder(order)}
                          style={{ 
                            borderBottom: '1px solid #f8fafc', cursor: 'pointer', 
                            background: selectedOrder?._id === order._id ? 'var(--primary-light)' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td style={{ padding: '1.25rem' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{order.shippingAddress.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.shippingAddress.phone}</div>
                          </td>
                          <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '1.25rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '6px', background: order.paymentMethod === 'BANK_TRANSFER' ? '#eff6ff' : '#f8fafc', color: order.paymentMethod === 'BANK_TRANSFER' ? '#2563eb' : '#64748b' }}>
                              {order.paymentMethod === 'BANK_TRANSFER' ? 'BANK' : 'COD'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: status.bg, color: status.color, fontSize: '0.75rem', fontWeight: 800 }}>
                              <status.icon size={12} /> {status.label}
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 900, color: '#1e293b' }}>
                            {order.totalAmount.toLocaleString()}đ
                          </td>
                          <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                            <ChevronRight size={18} color="#cbd5e1" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Details Sidebar/Overlay */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div 
                initial={isMobile ? { y: '100%' } : { x: 20, opacity: 0 }}
                animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
                exit={isMobile ? { y: '100%' } : { x: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ 
                  background: '#fff', 
                  borderRadius: isMobile ? '32px 32px 0 0' : '28px', 
                  border: '1px solid #f1f5f9', 
                  padding: isMobile ? '2rem 1.5rem' : '1.5rem', 
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
                  height: isMobile ? '90vh' : 'fit-content', 
                  position: isMobile ? 'fixed' : 'sticky', 
                  bottom: isMobile ? 0 : 'auto',
                  left: isMobile ? 0 : 'auto',
                  width: isMobile ? '100%' : 'auto',
                  top: isMobile ? 'auto' : '2rem',
                  zIndex: 3000,
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Chi tiết đơn hàng</h3>
                  <button onClick={() => setSelectedOrder(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XCircle size={20} color="#94a3b8" />
                  </button>
                </div>

                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={12} /> Người nhận</div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedOrder.shippingAddress.fullName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedOrder.shippingAddress.phone}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.4 }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city_detail}, {selectedOrder.shippingAddress.city}
                    </div>
                  </div>

                  <div style={{ border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Sản phẩm đã mua</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <img src={item.image} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.quantity} x {item.price.toLocaleString()}đ</div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Update Section - Optimized for Mobile */}
                <div style={{ marginTop: '2rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem', display: 'block' }}>Cập nhật trạng thái mới</label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                    {[
                      { val: 'PENDING', label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
                      { val: 'PROCESSING', label: 'Chuẩn bị', color: '#2563eb', bg: '#eff6ff' },
                      { val: 'SHIPPED', label: 'Giao hàng', color: '#7c3aed', bg: '#f5f3ff' },
                      { val: 'DELIVERED', label: 'Đã giao', color: '#16a34a', bg: '#f0fdf4' },
                      { val: 'CANCELLED', label: 'Hủy đơn', color: '#ef4444', bg: '#fef2f2' }
                    ].map(st => (
                      <motion.button
                        key={st.val}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateStatus(selectedOrder._id, st.val)}
                        style={{
                          padding: '1rem 0.75rem',
                          borderRadius: '16px',
                          border: selectedOrder.status === st.val ? `2px solid ${st.color}` : '1px solid #e2e8f0',
                          background: selectedOrder.status === st.val ? st.bg : '#fff',
                          color: st.color,
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.2s',
                          boxShadow: selectedOrder.status === st.val ? `0 4px 12px ${st.color}20` : 'none'
                        }}
                      >
                        {st.label}
                        {selectedOrder.status === st.val && <CheckCircle2 size={14} />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#64748b' }}>Tổng thanh toán:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>{selectedOrder.totalAmount.toLocaleString()}đ</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '10rem 0' }}>
              <ShoppingBag size={48} color="#cbd5e1" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
              <p style={{ color: '#94a3b8' }}>Chưa có đơn hàng nào trong mục này.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
