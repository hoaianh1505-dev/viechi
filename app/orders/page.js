'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Package } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'Chờ duyệt', icon: Clock, color: '#d46b08', bg: '#fff7e6' },
  processing: { label: 'Đang xử lý', icon: Package, color: '#096dd9', bg: '#e6f7ff' },
  shipped: { label: 'Đang giao', icon: Truck, color: '#722ed1', bg: '#f9f0ff' },
  delivered: { label: 'Đã giao', icon: CheckCircle2, color: '#389e0d', bg: '#f6ffed' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: '#cf1322', bg: '#fff1f0' }
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>Đang tải đơn hàng...</div>;
  }

  return (
    <div style={{ background: 'var(--bg-section)', minHeight: '85vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Đơn hàng của tôi</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order, idx) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card"
                style={{ padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mã đơn hàng</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>#{order._id.slice(-8).toUpperCase()}</h3>
                  </div>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', 
                    background: status.bg, color: status.color,
                    fontSize: '0.8rem', fontWeight: 700
                  }}>
                    <StatusIcon size={15} /> {status.label}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={item.image} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.quantity}{item.unit} x {item.price.toLocaleString()}đ</p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items.length} sản phẩm
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {order.shippingFee > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Phí ship: {order.shippingFee.toLocaleString()}đ
                      </div>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Tổng thanh toán:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{order.totalAmount.toLocaleString()}đ</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: '#fff', borderRadius: '20px', border: '1px dashed var(--border-card)' }}>
              <Package size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Bạn chưa có đơn hàng nào</h3>
              <button onClick={() => router.push('/')} className="btn btn-primary">Mua sắm ngay</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
