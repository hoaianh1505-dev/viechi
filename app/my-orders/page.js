'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, ChevronRight, Package, Calendar,
  ArrowLeft, CreditCard, Search, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status = '') => {
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7', icon: Clock };
      case 'confirmed':
      case 'processing': 
      case 'preparing': return { label: 'Chuẩn bị', color: '#2563eb', bg: '#eff6ff', icon: Package };
      case 'shipping':
      case 'shipped': return { label: 'Đang giao', color: '#7c3aed', bg: '#f5f3ff', icon: Truck };
      case 'delivered':
      case 'completed':
      case 'paid':
      case 'success': return { label: 'Đã giao', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2', icon: XCircle };
      default: return { label: status, color: '#64748b', bg: '#f1f5f9', icon: Clock };
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff9f5' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid #ffe2cc', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff9f5' }}>
        <div style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <ShoppingBag size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>Bạn chưa đăng nhập</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Vui lòng đăng nhập để xem lịch sử và trạng thái các đơn hàng của bạn.</p>
          <Link href="/login" style={{ display: 'block', padding: '1rem', background: 'var(--gradient)', color: '#fff', borderRadius: '16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 20px rgba(212,96,10,0.2)' }}>Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff9f5' }}>
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '80px 1rem 4rem' : '120px 2rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Đơn hàng của tôi</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Theo dõi trạng thái và lịch sử mua hàng của bạn</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center', border: '1px solid #fef2e8', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Package size={32} color="#cbd5e1" />
            </div>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Bạn chưa có đơn hàng nào.</p>
            <Link href="/products" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem' }}>Khám phá sản phẩm ngay →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order, idx) => {
              const status = getStatusInfo(order.status);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={order._id}
                  style={{
                    background: '#fff', 
                    borderRadius: '24px', 
                    border: '1px solid #fef2e8',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Order Header */}
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #fef2e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>#{order.orderCode || order._id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '100px', background: status.bg, color: status.color, fontSize: '0.75rem', fontWeight: 800 }}>
                      <status.icon size={12} /> {status.label}
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  {/* Order Items Summary */}
                  <div style={{ padding: '1.5rem 1.25rem' }}>
                    {/* Visual Timeline with Moving Indicator - PROMAX REDESIGN */}
                    <div style={{ position: 'relative', marginBottom: '6rem', padding: '0 10px', marginTop: '1rem' }}>
                      {/* Background Line */}
                      <div style={{ position: 'absolute', top: '20px', left: '12.5%', right: '12.5%', height: '4px', background: '#f1f5f9', borderRadius: '10px', zIndex: 0 }} />
                      
                      {/* Active Progress Line */}
                      {(() => {
                        const s = (order.status || '').toLowerCase();
                        const orderSteps = { 
                          'pending': 1, 
                          'confirmed': 2, 'processing': 2, 'preparing': 2,
                          'shipping': 3, 'shipped': 3,
                          'delivered': 4, 'completed': 4, 'paid': 4, 'success': 4,
                          'cancelled': 0 
                        };
                        const currentStep = orderSteps[s] || 0;
                        const progressPct = currentStep > 0 ? ((currentStep - 1) / 3) * 100 : 0;

                        return (
                          <>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct * 0.75}%` }}
                              style={{ 
                                position: 'absolute', top: '20px', left: '12.5%', 
                                height: '4px', background: 'var(--gradient)', 
                                zIndex: 0, borderRadius: '10px' 
                              }} 
                            />
                            
                            {/* Moving Product Image - HIGH END DESIGN */}
                            {currentStep > 0 && (
                              <motion.div
                                initial={false}
                                animate={{ left: `${12.5 + (progressPct * 0.75)}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 25 }}
                                style={{ 
                                  position: 'absolute', top: '75px', 
                                  zIndex: 10, transform: 'translateX(-50%)',
                                  pointerEvents: 'none',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}
                              >
                                {/* Animated Pointer Arrow */}
                                <motion.div 
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  style={{ 
                                    width: '0', height: '0', 
                                    borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
                                    borderBottom: '8px solid var(--primary)',
                                    marginBottom: '4px'
                                  }} 
                                />
                                
                                <motion.div
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                  style={{
                                    width: '56px', height: '56px', 
                                    borderRadius: '16px', overflow: 'hidden', 
                                    border: '3px solid #fff', 
                                    boxShadow: '0 12px 25px rgba(212,96,10,0.25)',
                                    background: 'var(--gradient)',
                                    position: 'relative',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                >
                                  <ShoppingBag size={28} color="#fff" />
                                </motion.div>
                                
                                <div style={{ 
                                  marginTop: '0.5rem', background: 'var(--primary)', color: '#fff', 
                                  fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', 
                                  borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                  boxShadow: '0 4px 10px rgba(212,96,10,0.2)'
                                }}>
                                  Hiện tại
                                </div>
                              </motion.div>
                            )}
                          </>
                        );
                      })()}

                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                        {[
                          { key: 'pending', label: 'Đặt hàng', icon: Calendar, step: 1 },
                          { key: 'confirmed', label: 'Chuẩn bị', icon: Package, step: 2 },
                          { key: 'shipping', label: 'Đang giao', icon: Truck, step: 3 },
                          { key: 'delivered', label: 'Hoàn tất', icon: CheckCircle2, step: 4 }
                        ].map((step, sIdx) => {
                          const s = (order.status || '').toLowerCase();
                          const orderSteps = { 
                            'pending': 1, 
                            'confirmed': 2, 'processing': 2, 'preparing': 2,
                            'shipping': 3, 'shipped': 3,
                            'delivered': 4, 'completed': 4, 'paid': 4, 'success': 4,
                            'cancelled': 0 
                          };
                          const currentStep = orderSteps[s] || 0;
                          const isActive = currentStep >= step.step;
                          const isCancelled = s === 'cancelled';

                          return (
                            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                              <div style={{ 
                                width: '40px', height: '40px', borderRadius: '14px', 
                                background: isCancelled ? '#fef2f2' : (isActive ? 'var(--gradient)' : '#fff'),
                                color: isCancelled ? '#ef4444' : (isActive ? '#fff' : '#cbd5e1'),
                                border: isActive ? 'none' : '2px solid #f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isActive ? '0 8px 15px rgba(212,96,10,0.15)' : 'none',
                                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                              }}>
                                <step.icon size={20} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 900 : 600, color: isActive ? '#1e293b' : '#94a3b8', textAlign: 'center' }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ flexShrink: 0, width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tổng cộng ({order.items.length} món)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{order.totalAmount.toLocaleString()}đ</div>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        style={{ 
                          padding: '0.8rem 1.5rem', borderRadius: '14px', 
                          background: 'var(--primary)', color: '#fff', 
                          fontSize: '0.85rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                          boxShadow: '0 8px 15px rgba(212,96,10,0.2)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ORDER DETAIL MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ 
                position: 'relative', background: '#fff', width: '100%', maxWidth: '500px', 
                borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.25rem' }}>Chi tiết đơn hàng</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} color="#64748b" />
                </button>
              </div>
              
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                {/* Shipping Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>
                    <Map size={16} /> THÔNG TIN NHẬN HÀNG
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>{selectedOrder.shippingAddress?.fullName}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress?.phone}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                  </div>
                </div>

                {/* Items List */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Sản phẩm đã mua</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.quantity} x {item.price.toLocaleString()}đ</div>
                        </div>
                        <div style={{ fontWeight: 900, color: '#1e293b' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                    <span>Tạm tính</span>
                    <span>{selectedOrder.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                    <span>Phí vận chuyển</span>
                    <span>{selectedOrder.shippingFee?.toLocaleString() || '0'}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Tổng cộng</span>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary)' }}>{selectedOrder.totalAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: '#1e293b', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
