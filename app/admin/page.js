'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, Users, DollarSign, 
  TrendingUp, Clock, CheckCircle, ArrowRight, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    productCount: 0,
    userCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, oRes, uRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/admin/users')
        ]);
        
        const products = pRes.ok ? await pRes.json() : [];
        const orders = oRes.ok ? await oRes.json() : [];
        const users = uRes.ok ? await uRes.json() : [];

        const validOrders = Array.isArray(orders) ? orders : [];
        const validProducts = Array.isArray(products) ? products : [];
        const validUsers = Array.isArray(users) ? users : [];

        const totalSales = validOrders.reduce((acc, curr) => 
          curr.status === 'delivered' ? acc + (Number(curr.totalAmount) || 0) : acc, 0
        );

        setStats({
          totalSales,
          orderCount: validOrders.length,
          productCount: validProducts.length,
          userCount: validUsers.length
        });

        setRecentOrders(validOrders.slice(0, 5));
      } catch (error) {
        console.error('CRITICAL: Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  const cards = [
    { label: 'Doanh thu', value: stats.totalSales.toLocaleString() + 'đ', icon: DollarSign, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Đơn hàng', value: stats.orderCount, icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Sản phẩm', value: stats.productCount, icon: Package, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Khách hàng', value: stats.userCount, icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Chào mừng trở lại! 👋</h1>
        <p style={{ color: '#64748b' }}>Dưới đây là tình hình kinh doanh của shop hôm nay.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <card.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Đơn hàng gần đây</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.8rem' }}>
                  <th style={{ padding: '1rem' }}>MÃ ĐƠN</th>
                  <th style={{ padding: '1rem' }}>KHÁCH HÀNG</th>
                  <th style={{ padding: '1rem' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>TỔNG TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.85rem' }}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{order.shippingInfo?.fullName}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                        background: order.status === 'delivered' ? '#f6ffed' : '#f1f5f9',
                        color: order.status === 'delivered' ? '#389e0d' : '#475569'
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString()}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / AI Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--gradient)', borderRadius: '32px', padding: '2rem', color: '#fff' }}>
            <TrendingUp size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>AI Insights</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>Bạn có <strong>{recentOrders.filter(o => o.status === 'pending').length} đơn hàng</strong> đang chờ xử lý. Hãy hoàn thiện chúng để tăng điểm uy tín cho shop nhé!</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" /> Hoạt động gần đây
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '5px' }} />
                <p style={{ fontSize: '0.85rem', color: '#1e293b' }}>Bạn vừa cập nhật cấu hình Banner trang chủ.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '5px' }} />
                <p style={{ fontSize: '0.85rem', color: '#1e293b' }}>Đã thêm 4 sản phẩm mới vào danh mục Hải sản.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
