'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Clock, Package, Truck, CheckCircle2, 
  Calendar, MapPin, CreditCard, ChevronRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

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

  if (loading || userLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: '5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <button onClick={() => router.push('/')} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
             <ArrowLeft size={20} />
           </button>
           <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-1px' }}>Đơn hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', padding: '5rem', borderRadius: '40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.03)' }}>
            <ShoppingBag size={80} color="#e2e8f0" style={{ marginBottom: '2rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Hộp thư đơn hàng đang trống</h2>
            <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Bắt đầu hành trình thưởng thức đặc sản ngay hôm nay!</p>
            <Link href="/#products" className="btn btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800 }}>Mua sắm ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {orders.map((order, idx) => {
              const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
              const currentStepIdx = statusSteps.indexOf(order.status);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  style={{ 
                    background: '#fff', 
                    borderRadius: '40px', 
                    padding: '2.5rem',
                    boxShadow: '0 30px 70px rgba(0,0,0,0.04)',
                    border: '1px solid #f8fafc',
                    position: 'relative'
                  }}
                >
                  {/* Order Top Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
                        <ShoppingBag size={28} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '0.5px' }}>#{order._id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1.5rem', borderRadius: '20px', 
                      background: order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7', 
                      color: order.status === 'CANCELLED' ? '#ef4444' : '#d4600a',
                      fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem'
                    }}>
                      <Clock size={16} /> {order.status === 'PENDING' ? 'Chờ xử lý' : order.status === 'CANCELLED' ? 'Đã hủy' : 'Đang xử lý'}
                    </div>
                  </div>

                  {/* Visual Progress Timeline (Matches Screenshot) */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ position: 'relative', marginBottom: '5rem', padding: '0 2rem' }}>
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
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                              <div style={{ 
                                width: '56px', height: '56px', borderRadius: '20px', 
                                background: isDone ? 'var(--gradient)' : '#fff',
                                color: isDone ? '#fff' : '#cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: isDone ? 'none' : '2px solid #f1f5f9',
                                boxShadow: isDone ? '0 10px 25px rgba(212,96,10,0.25)' : 'none',
                                transition: 'all 0.5s'
                              }}>
                                {React.cloneElement(s.icon, { size: 24 })}
                              </div>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isDone ? '#1e293b' : '#cbd5e1' }}>{s.label}</span>
                              
                              {/* HIỆN TẠI Badge with Triangle Indicator */}
                              {isCurrent && (
                                <div style={{ position: 'absolute', top: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '7px solid #d4600a' }} />
                                  <div style={{ background: '#d4600a', color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap', boxShadow: '0 5px 15px rgba(212,96,10,0.3)' }}>
                                    HIỆN TẠI
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Connection Line */}
                      <div style={{ position: 'absolute', top: '28px', left: '60px', right: '60px', height: '2px', background: '#f1f5f9', zIndex: 0 }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStepIdx / 3) * 100}%` }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                          style={{ height: '100%', background: 'var(--gradient)', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Horizontal Stacked Product Images */}
                  <div style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '15px' }}>
                      {order.items.map((item, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -12, scale: 1.1, zIndex: 100 }}
                          style={{
                            width: '90px', height: '90px', borderRadius: '24px', border: '5px solid #fff',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)', overflow: 'hidden', background: '#fff',
                            marginLeft: i === 0 ? 0 : '-40px', // Perfect horizontal overlap
                            zIndex: i, position: 'relative'
                          }}
                        >
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </motion.div>
                      ))}
                      {order.items.length > 5 && (
                        <div style={{ marginLeft: '1.5rem', background: '#f8fafc', padding: '0.6rem 1.2rem', borderRadius: '15px', fontSize: '0.95rem', fontWeight: 900, color: '#64748b', border: '1px solid #f1f5f9' }}>
                          +{order.items.length - 5} sản phẩm khác
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #fcfcfc', paddingTop: '2.5rem' }}>
                    <div>
                      <p style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Tổng cộng ({order.items.length} món)</p>
                      <div style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--primary)', letterSpacing: '-1px' }}>
                        {order.totalAmount?.toLocaleString()}đ
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       {order.status === 'PENDING' && (
                         <button onClick={() => handleCancel(order._id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', padding: '0 1.5rem' }}>Hủy đơn</button>
                       )}
                       <Link 
                        href="/#products"
                        style={{ 
                          padding: '1.2rem 3.5rem', borderRadius: '22px', background: 'var(--gradient)', color: '#fff', 
                          fontSize: '1.1rem', fontWeight: 900, textDecoration: 'none',
                          boxShadow: '0 15px 35px rgba(212,96,10,0.35)',
                          display: 'inline-flex', alignItems: 'center', gap: '0.75rem'
                        }}
                      >
                        Chi tiết <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
      `}</style>
    </div>
  );
}
