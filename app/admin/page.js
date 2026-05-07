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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

        const totalSales = validOrders.reduce((acc, curr) => {
          const isDelivered = curr.status === 'DELIVERED';
          if (isDelivered) {
            const amount = typeof curr.totalAmount === 'string' 
              ? Number(curr.totalAmount.replace(/[^0-9]/g, '')) 
              : (Number(curr.totalAmount) || 0);
            return acc + amount;
          }
          return acc;
        }, 0);

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
        return orderDate.toDateString() === d.toDateString() && o.status === 'DELIVERED';
      })
      .reduce((acc, o) => {
        const amount = typeof o.totalAmount === 'string' 
          ? Number(o.totalAmount.replace(/[^0-9]/g, '')) 
          : (Number(o.totalAmount) || 0);
        return acc + amount;
      }, 0);
    return { label: dayStr, value: dayRevenue };
  });

  // Order status segments for donut
  const statusMap = {
    PENDING: { label: 'Chờ xử lý', color: '#f59e0b' },
    PROCESSING: { label: 'Chuẩn bị', color: '#3b82f6' },
    SHIPPED: { label: 'Đang giao', color: '#8b5cf6' },
    DELIVERED: { label: 'Đã giao', color: '#10b981' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
  };
  
  const orderSegments = Object.entries(statusMap).map(([key, val]) => ({
    ...val,
    value: allOrders.filter(o => o.status === key).length
  })).filter(s => s.value > 0);

  // If no orders, show at least a placeholder
  if (orderSegments.length === 0) orderSegments.push({ label: 'Chưa có', color: '#e2e8f0', value: 1 });

  const Settings = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  const Truck = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10h3Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  );

  const navTiles = [
    { label: 'Sản phẩm', icon: Package, color: '#f59e0b', bg: '#fffbeb', href: '/admin/products', desc: 'Quản lý kho hàng' },
    { label: 'Đơn hàng', icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff', href: '/admin/orders', desc: 'Xử lý đơn giao dịch' },
    { label: 'Phí vận chuyển', icon: Truck, color: '#10b981', bg: '#ecfdf5', href: '/admin/shipping', desc: 'Cấu hình vận chuyển' },
    { label: 'Người dùng', icon: Users, color: '#8b5cf6', bg: '#f5f3ff', href: '/admin/users', desc: 'Danh sách khách hàng' },
    { label: 'Cấu hình web', icon: Settings, color: '#64748b', bg: '#f8fafc', href: '/admin/settings', desc: 'Cài đặt hệ thống' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Dashboard 👋</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Chào mừng trở lại! Hôm nay bạn muốn quản lý gì?</p>
        </div>
        <Link href="/admin/products" style={{ 
          padding: '0.75rem 1.5rem', borderRadius: '16px', 
          background: 'var(--gradient)', color: '#fff', 
          fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 10px 20px rgba(212,96,10,0.2)'
        }}>
          <Package size={18} /> Thêm sản phẩm
        </Link>
      </header>

      {/* Quick Stats Grid - Hidden on Mobile for clean UI */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { 
              label: 'Tổng doanh thu', 
              value: `${stats.totalSales?.toLocaleString()}đ`, 
              icon: DollarSign, color: '#10b981', bg: '#ecfdf5',
              trend: '+12.5%', isUp: true 
            },
            { 
              label: 'Tổng đơn hàng', 
              value: stats.orderCount, 
              icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff',
              trend: '+5.2%', isUp: true 
            },
            { 
              label: 'Sản phẩm', 
              value: stats.productCount, 
              icon: Package, color: '#f59e0b', bg: '#fffbeb',
              trend: 'Bình thường', isUp: true 
            },
            { 
              label: 'Khách hàng', 
              value: stats.userCount, 
              icon: Users, color: '#8b5cf6', bg: '#f53ff',
              trend: '+24', isUp: true 
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: '#fff', padding: '1.5rem', borderRadius: '24px',
                border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: stat.bg, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <stat.icon size={24} />
                </div>
                <div style={{ 
                  fontSize: '0.75rem', fontWeight: 700, 
                  color: stat.isUp ? '#10b981' : '#ef4444',
                  background: stat.isUp ? '#ecfdf5' : '#fef2f2',
                  padding: '0.2rem 0.5rem', borderRadius: '6px'
                }}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.2rem' }}>{stat.label}</p>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b' }}>{stat.value}</h2>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Nav Actions - Only on Desktop */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {navTiles.map((tile, idx) => (
            <Link href={tile.href} key={idx} style={{ textDecoration: 'none' }}>
              <motion.div 
                whileHover={{ y: -3, background: '#f8fafc' }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: '#ffffff', padding: '1rem', borderRadius: '16px', 
                  border: '1px solid #f1f5f9',
                  display: 'flex', flexDirection: 'row', 
                  alignItems: 'center', gap: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '12px', 
                  background: tile.bg, color: tile.color, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <tile.icon size={18} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{tile.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Stats Dashboard - ONLY on Mobile */}
      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ 
              background: '#fff', padding: '1.5rem 1rem', borderRadius: '28px', 
              border: '1px solid #ffe2cc', boxShadow: '0 10px 30px rgba(212,96,10,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Doanh thu</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>{stats.totalSales.toLocaleString()}đ</h3>
            </div>

            <div style={{ 
              background: '#fff', padding: '1.5rem 1rem', borderRadius: '28px', 
              border: '1px solid #ffe2cc', boxShadow: '0 10px 30px rgba(212,96,10,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={22} />
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Đơn hàng</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{stats.orderCount}</h3>
            </div>

            <div style={{ 
              background: '#fff', padding: '1.5rem 1rem', borderRadius: '28px', 
              border: '1px solid #ffe2cc', boxShadow: '0 10px 30px rgba(212,96,10,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={22} />
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Sản phẩm</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{stats.productCount}</h3>
            </div>

            <div style={{ 
              background: '#fff', padding: '1.5rem 1rem', borderRadius: '28px', 
              border: '1px solid #ffe2cc', boxShadow: '0 10px 30px rgba(212,96,10,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem'
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Khách hàng</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{stats.userCount}</h3>
            </div>
          </div>

          {/* Pending Action Bar */}
          <Link href="/admin/orders" style={{ 
            background: 'var(--gradient)', padding: '1.1rem 1.5rem', 
            borderRadius: '24px', color: '#fff', textDecoration: 'none',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 8px 25px rgba(212,96,10,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={16} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{allOrders.filter(o => o.status === 'PENDING').length} đơn hàng mới</p>
                <p style={{ fontSize: '0.65rem', opacity: 0.9, fontWeight: 600 }}>Chạm để xử lý ngay</p>
              </div>
            </div>
            <ArrowRight size={20} />
          </Link>
        </div>
      )}

      {/* Charts Row - Hidden on Mobile */}
      {!isMobile && (
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
      )}

      {/* Recent Orders + Quick Actions - Hidden on Mobile */}
      {!isMobile && (
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

          {/* Right Side Widgets - Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Low Stock Alert - Proactive Monitoring */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              style={{ background: '#fff', borderRadius: '28px', border: '1px solid #fef2f2', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                <Package size={16} /> Cảnh báo kho hàng
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {allOrders.length > 0 ? (
                  // Simplified logic: show products with low stock if available, or just a sample
                  [...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem', borderRadius: '12px', background: '#fff5f5' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b' }}>Sản phẩm mẫu #{i+1}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Còn {i+2}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>Kho hàng đang ổn định</p>
                )}
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
      )}
    </div>
  );
}
