'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, ArrowLeft, Calendar, Package,
  ChevronRight, MapPin, CreditCard, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
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
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'CANCELLED' })
      });
      if (res.ok) {
        toast.success('Đã hủy đơn hàng');
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'CANCELLED' } : o));
      }
    } catch (e) {
      toast.error('Lỗi hủy đơn');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '4px solid #eee', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button onClick={() => router.push('/')} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
             <ArrowLeft size={18} />
           </button>
           <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Lịch sử mua hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '32px', textAlign: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.02)' }}>
            <ShoppingBag size={64} color="#e2e8f0" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Hộp thư đơn hàng trống</h2>
            <Link href="/#products" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 800 }}>Mua sắm ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order, idx) => {
              const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
              const currentStepIdx = statusSteps.indexOf(order.status);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ 
                    background: '#fff', 
                    borderRadius: '28px', 
                    padding: '1.5rem',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.03)',
                    border: '1px solid #f8fafc',
                    position: 'relative'
                  }}
                >
                  {/* Order Top Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>#{order._id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.4rem 1rem', borderRadius: '12px', 
                      background: order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7', 
                      color: order.status === 'CANCELLED' ? '#ef4444' : '#d4600a',
                      fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                      <Clock size={12} /> {order.status === 'PENDING' ? 'Chờ xử lý' : order.status === 'CANCELLED' ? 'Đã hủy' : 'Đang xử lý'}
                    </div>
                  </div>

                  {/* Visual Progress Timeline */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ position: 'relative', marginBottom: '3rem', padding: '0 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        {[
                          { label: 'Đặt hàng', icon: <Calendar /> },
                          { label: 'Chuẩn bị', icon: <Package /> },
                          { label: 'Đang giao', icon: <Truck /> },
                          { label: 'Hoàn tất', icon: <CheckCircle2 /> }
                        ].map((s, i) => {
                          const isDone = i <= currentStepIdx;
                          const isCurrent = i === currentStepIdx;
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                              <div style={{ 
                                width: '38px', height: '38px', borderRadius: '12px', 
                                background: isDone ? 'var(--gradient)' : '#fff',
                                color: isDone ? '#fff' : '#cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: isDone ? 'none' : '1px solid #f1f5f9',
                                transition: 'all 0.3s'
                              }}>
                                {React.cloneElement(s.icon, { size: 16 })}
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isDone ? '#1e293b' : '#cbd5e1' }}>{s.label}</span>
                              
                              {isCurrent && (
                                <div style={{ position: 'absolute', top: '100%', marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '4px solid #d4600a' }} />
                                  <div style={{ background: '#d4600a', color: '#fff', fontSize: '0.55rem', fontWeight: 900, padding: '2px 6px', borderRadius: '5px', whiteSpace: 'nowrap' }}>
                                    HIỆN TẠI
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ position: 'absolute', top: '19px', left: '45px', right: '45px', height: '1.5px', background: '#f1f5f9', zIndex: 0 }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStepIdx / 3) * 100}%` }}
                          transition={{ duration: 1.5 }}
                          style={{ height: '100%', background: 'var(--gradient)', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Horizontal Stacked Product Images */}
                  <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                      {order.items.map((item, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -5, scale: 1.05, zIndex: 100 }}
                          style={{
                            width: '60px', height: '60px', borderRadius: '16px', border: '3px solid #fff',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.06)', overflow: 'hidden', background: '#fff',
                            marginLeft: i === 0 ? 0 : '-25px', 
                            zIndex: i, position: 'relative'
                          }}
                        >
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                      ))}
                      {order.items.length > 5 && (
                        <div style={{ marginLeft: '1rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900, color: '#64748b' }}>
                          +{order.items.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #f8fafc', paddingTop: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.2rem 0' }}>Tổng cộng ({order.items.length} món)</p>
                      <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--primary)' }}>
                        {order.totalAmount?.toLocaleString()}đ
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                       {order.status === 'PENDING' && (
                         <button onClick={() => handleCancel(order._id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Hủy đơn</button>
                       )}
                       <button 
                        onClick={() => setSelectedOrder(order)}
                        style={{ 
                          padding: '0.7rem 2rem', borderRadius: '14px', background: 'var(--gradient)', color: '#fff', 
                          fontSize: '0.9rem', fontWeight: 900, border: 'none',
                          boxShadow: '0 8px 20px rgba(212,96,10,0.15)',
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                        }}
                      >
                        Chi tiết <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Customer Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
              />
              <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, pointerEvents: 'none', padding: '1.5rem' }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  style={{ background: '#fff', borderRadius: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>Chi tiết đơn hàng</h2>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>Mã đơn: #{selectedOrder._id.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><XCircle size={20} /></button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Products List */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '24px' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={14} /> Sản phẩm</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <img src={item.image} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.quantity} x {item.price.toLocaleString()}đ</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div style={{ border: '1.5px solid #f1f5f9', padding: '1.25rem', borderRadius: '24px' }}>
                       <h3 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> Thông tin giao hàng</h3>
                       <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>{selectedOrder.shippingAddress.fullName}</div>
                       <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedOrder.shippingAddress.phone}</div>
                       <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                         {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.city_detail}, {selectedOrder.shippingAddress.city}
                       </p>
                    </div>

                    {/* Payment Summary */}
                    <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>{selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Thanh toán COD'}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--primary)' }}>{selectedOrder.totalAmount.toLocaleString()}đ</div>
                      </div>
                      <div style={{ padding: '0.5rem 1rem', background: '#fff', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, color: '#d4600a' }}>
                        {selectedOrder.status === 'PENDING' ? 'Đang xử lý' : selectedOrder.status === 'CANCELLED' ? 'Đã hủy' : 'Đã giao'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyOrdersPage;
