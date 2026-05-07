'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, ChevronRight, Package, Calendar,
  ArrowLeft, CreditCard, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <ShoppingBag size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>Bạn chưa đăng nhập</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Vui lòng đăng nhập để xem lịch sử và trạng thái các đơn hàng của bạn.</p>
          <Link href="/login" style={{ display: 'block', padding: '1rem', background: 'var(--gradient)', color: '#fff', borderRadius: '16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 20px rgba(212,96,10,0.2)' }}>Đăng nhập ngay</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff9f5' }}>
      <Navbar />
      
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
                  <div style={{ padding: '1.5rem 1.25rem' }}>
                    {/* Visual Timeline */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative', padding: '0 10px' }}>
                      <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: '#f1f5f9', zIndex: 0 }} />
                      
                      {[
                        { key: 'PENDING', label: 'Đặt hàng', icon: Calendar, step: 1 },
                        { key: 'PROCESSING', label: 'Chuẩn bị', icon: Package, step: 2 },
                        { key: 'SHIPPED', label: 'Đang giao', icon: Truck, step: 3 },
                        { key: 'DELIVERED', label: 'Hoàn tất', icon: CheckCircle2, step: 4 }
                      ].map((step, sIdx) => {
                        const orderSteps = { 'PENDING': 1, 'PROCESSING': 2, 'SHIPPED': 3, 'DELIVERED': 4, 'CANCELLED': 0 };
                        const currentStep = orderSteps[order.status] || 0;
                        const isActive = currentStep >= step.step;
                        const isCancelled = order.status === 'CANCELLED';

                        return (
                          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '50%', 
                              background: isCancelled ? '#fef2f2' : (isActive ? 'var(--primary)' : '#fff'),
                              color: isCancelled ? '#ef4444' : (isActive ? '#fff' : '#cbd5e1'),
                              border: isActive ? 'none' : '2px solid #f1f5f9',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isActive ? '0 4px 10px rgba(212,96,10,0.2)' : 'none',
                              transition: 'all 0.3s'
                            }}>
                              <step.icon size={16} />
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#1e293b' : '#94a3b8', textAlign: 'center' }}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
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
                      <Link 
                        href={`/checkout?orderId=${order._id}`}
                        style={{ 
                          padding: '0.8rem 1.5rem', borderRadius: '14px', 
                          background: 'var(--primary)', color: '#fff', 
                          fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none',
                          boxShadow: '0 8px 15px rgba(212,96,10,0.2)'
                        }}
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
