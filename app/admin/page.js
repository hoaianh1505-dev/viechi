'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, Users, DollarSign, 
  TrendingUp, Clock, ArrowRight, Loader2, ArrowUpRight, BarChart3, PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mini Bar Chart Component (Pure CSS)
const MiniBarChart = ({ data, color = 'var(--primary)' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '0.5rem 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%', minHeight: '4px',
              borderRadius: '6px 6px 4px 4px',
              background: i === data.length - 1 ? color : `${color}40`,
              cursor: 'default',
              position: 'relative'
            }}
            title={`${d.label}: ${d.value.toLocaleString()}đ`}
          />
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// Donut Chart Component (Pure CSS/SVG)
const DonutChart = ({ segments, size = 120 }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let cumulative = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const offset = cumulative * circumference;
          cumulative += pct;
          return (
            <motion.circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
        })}
      </svg>
      <div style={{ 
        position: 'absolute', inset: 0, 
        display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center' 
      }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{total}</span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Đơn hàng</span>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0, userCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
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

        setAllOrders(validOrders);
        setRecentOrders(validOrders.slice(0, 5));
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" /></div>;

  // Build 7-day revenue data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T');
    const dayRevenue = allOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === d.toDateString() && o.status === 'delivered';
      })
      .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    return { label: dayStr, value: dayRevenue };
  });

  // Order status segments for donut
  const statusMap = {
    pending: { label: 'Chờ xử lý', color: '#f59e0b' },
    confirmed: { label: 'Đã xác nhận', color: '#3b82f6' },
    shipping: { label: 'Đang giao', color: '#8b5cf6' },
    delivered: { label: 'Hoàn thành', color: '#10b981' },
    cancelled: { label: 'Đã hủy', color: '#ef4444' },
  };
  
  const orderSegments = Object.entries(statusMap).map(([key, val]) => ({
    ...val,
    value: allOrders.filter(o => o.status === key).length
  })).filter(s => s.value > 0);

  // If no orders, show at least a placeholder
  if (orderSegments.length === 0) orderSegments.push({ label: 'Chưa có', color: '#e2e8f0', value: 1 });

  const cards = [
    { label: 'Doanh thu', value: stats.totalSales.toLocaleString() + 'đ', icon: DollarSign, color: '#10b981', bg: '#ecfdf5', trend: '+12%' },
    { label: 'Đơn hàng', value: stats.orderCount, icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff', trend: '+5%' },
    { label: 'Sản phẩm', value: stats.productCount, icon: Package, color: '#f59e0b', bg: '#fffbeb', trend: null },
    { label: 'Khách hàng', value: stats.userCount, icon: Users, color: '#8b5cf6', bg: '#f5f3ff', trend: '+8%' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b' }}>Dashboard 👋</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Tổng quan tình hình kinh doanh của bạn.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/products" style={{ 
            padding: '0.6rem 1.2rem', borderRadius: '12px', 
            background: 'var(--primary)', color: '#fff', 
            fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(212,96,10,0.2)'
          }}>
            <Package size={16} /> Thêm sản phẩm
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            style={{ 
              background: '#fff', padding: '1.5rem', borderRadius: '24px', 
              border: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: card.bg, color: card.color, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <card.icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{card.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{card.value}</h3>
              </div>
            </div>
            {card.trend && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.2rem',
                padding: '0.25rem 0.6rem', borderRadius: '8px',
                background: '#ecfdf5', color: '#10b981',
                fontSize: '0.75rem', fontWeight: 800
              }}>
                <ArrowUpRight size={12} /> {card.trend}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Revenue Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <BarChart3 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Doanh thu 7 ngày</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thống kê doanh thu đơn hàng đã hoàn thành</p>
            </div>
            <div style={{ 
              padding: '0.3rem 0.8rem', borderRadius: '8px', 
              background: '#f8fafc', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' 
            }}>
              7 ngày
            </div>
          </div>
          <MiniBarChart data={last7Days} />
        </motion.div>

        {/* Order Status Donut */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PieChart size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Trạng thái đơn hàng</h3>
          </div>
          <DonutChart segments={orderSegments} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem' }}>
            {orderSegments.filter(s => s.label !== 'Chưa có').map((seg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.color }} />
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{seg.label}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{seg.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Đơn hàng gần đây</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '0.5rem 1rem' }}>
            {recentOrders.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>MÃ ĐƠN</th>
                    <th style={{ padding: '0.8rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>KHÁCH HÀNG</th>
                    <th style={{ padding: '0.8rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '0.8rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>TỔNG TIỀN</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const sMap = statusMap[order.status] || { label: order.status, color: '#94a3b8' };
                    return (
                      <tr key={order._id} style={{ borderTop: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.9rem 0.8rem', fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>#{order._id.slice(-6).toUpperCase()}</td>
                        <td style={{ padding: '0.9rem 0.8rem', fontSize: '0.85rem', color: '#64748b' }}>{order.shippingInfo?.fullName || '—'}</td>
                        <td style={{ padding: '0.9rem 0.8rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                            background: sMap.color + '15', color: sMap.color
                          }}>
                            {sMap.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 0.8rem', textAlign: 'right', fontWeight: 900, color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString()}đ</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <ShoppingBag size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AI Insights Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '28px', padding: '2rem', color: '#fff',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(212,96,10,0.15)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <TrendingUp size={28} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>Tóm tắt nhanh</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.7 }}>
                Bạn có <strong style={{ color: '#f59e0b' }}>{allOrders.filter(o => o.status === 'pending').length} đơn</strong> chờ xử lý
                {allOrders.filter(o => o.status === 'shipping').length > 0 && (
                  <> và <strong style={{ color: '#8b5cf6' }}>{allOrders.filter(o => o.status === 'shipping').length} đơn</strong> đang giao</>
                )}.
              </p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--primary)" /> Truy cập nhanh
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'Quản lý đơn hàng', href: '/admin/orders', color: '#3b82f6' },
                { label: 'Thêm sản phẩm', href: '/admin/products', color: '#f59e0b' },
                { label: 'Cấu hình web', href: '/admin/settings', color: '#10b981' },
                { label: 'Quản lý người dùng', href: '/admin/users', color: '#8b5cf6' },
              ].map((item, i) => (
                <Link key={i} href={item.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.7rem 1rem', borderRadius: '12px',
                  background: '#f8fafc', textDecoration: 'none',
                  transition: 'all 0.2s', border: '1px solid transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '40'; e.currentTarget.style.background = item.color + '08'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.label}</span>
                  <ArrowRight size={14} color={item.color} />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
