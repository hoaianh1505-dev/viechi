'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, 
  XCircle, Filter, Eye, Phone, MapPin, 
  ChevronRight, Calendar, User, CreditCard, ChevronDown,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Custom Dropdown Component for Status
const StatusDropdown = ({ currentStatus, onStatusChange, getStatusInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const status = getStatusInfo(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  const options = [
    { val: 'PENDING', label: 'Chờ xử lý' },
    { val: 'PROCESSING', label: 'Chuẩn bị' },
    { val: 'SHIPPED', label: 'Đang giao' },
    { val: 'DELIVERED', label: 'Đã giao' },
    { val: 'CANCELLED', label: 'Hủy đơn' }
  ];

  return (
    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => !isCancelled && setIsOpen(!isOpen)}
        disabled={isCancelled}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem', 
          padding: '0.5rem 1rem', borderRadius: '999px', 
          background: status.bg, color: status.color, 
          fontSize: '0.75rem', fontWeight: 800,
          border: 'none', cursor: isCancelled ? 'not-allowed' : 'pointer', 
          transition: 'all 0.2s',
          minWidth: '130px', justifyContent: 'center',
          opacity: isCancelled ? 0.6 : 1
        }}
      >
        <status.icon size={14} /> {status.label} 
        {!isCancelled && <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
      </button>

      <AnimatePresence>
        {!isCancelled && isOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 5 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              style={{
                position: 'absolute', top: '100%', left: 0, width: '160px',
                background: '#fff', borderRadius: '18px', padding: '0.6rem',
                boxShadow: '0 15px 35px rgba(0,0,0,0.12)', zIndex: 11,
                border: '1px solid #f1f5f9'
              }}
            >
              {options.map(opt => {
                const info = getStatusInfo(opt.val);
                return (
                  <button
                    key={opt.val}
                    onClick={() => { onStatusChange(opt.val); setIsOpen(false); }}
                    style={{
                      width: '100%', padding: '0.6rem 0.8rem', borderRadius: '12px',
                      border: 'none', background: currentStatus === opt.val ? info.bg : 'rgba(255, 255, 255, 0)',
                      color: currentStatus === opt.val ? info.color : '#64748b',
                      fontSize: '0.75rem', fontWeight: 700, textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    <info.icon size={14} /> {opt.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        toast.success(`Cập nhật trạng thái thành công`);
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
      case 'PROCESSING': return { label: 'Chuẩn bị', color: '#2563eb', bg: '#eff6ff', icon: Package };
      case 'SHIPPED': return { label: 'Đang giao', color: '#7c3aed', bg: '#f5f3ff', icon: Truck };
      case 'DELIVERED': return { label: 'Đã giao', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2', icon: XCircle };
      default: return { label: status, color: '#64748b', bg: '#f1f5f9', icon: Clock };
    }
  };


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
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
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
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isMobile ? (
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
                      return (
                        <tr key={order._id} 
                          onClick={() => setSelectedOrder(order)}
                          style={{ 
                            borderBottom: '1px solid #f8fafc', cursor: 'pointer', 
                            background: selectedOrder?._id === order._id ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0)',
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
                            <StatusDropdown 
                              currentStatus={order.status} 
                              onStatusChange={(newVal) => updateStatus(order._id, newVal)} 
                              getStatusInfo={getStatusInfo}
                            />
                          </td>
                          <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 900, color: '#1e293b' }}>
                            {order.totalAmount.toLocaleString()}đ
                          </td>
                          <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                             <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                             >
                              Chi tiết
                             </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedOrder && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    zIndex: 9998
                  }}
                />
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'none', padding: '1rem' }}>
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    style={{ 
                      background: '#fff', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                      width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto', position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1e293b' }}>Chi tiết đơn hàng</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>#{selectedOrder._id.toUpperCase()}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} style={{ background: '#f8fafc', border: 'none', cursor: 'pointer', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '2rem' }}>
                      <div>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={14} /> Sản phẩm</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img src={item.image} style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.quantity} x {item.price.toLocaleString()}đ</div>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ border: '1.5px solid #f1f5f9', padding: '1.5rem', borderRadius: '24px' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> Giao hàng</h4>
                          <div style={{ fontWeight: 700 }}>{selectedOrder.shippingAddress.fullName}</div>
                          <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedOrder.shippingAddress.phone}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                            {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.city_detail}, {selectedOrder.shippingAddress.city}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--primary-light)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Thanh toán</div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'COD'}</div>
                          <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--primary)', marginTop: '1rem' }}>{selectedOrder.totalAmount.toLocaleString()}đ</div>
                        </div>
                        <div style={{ padding: '1.5rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '1rem' }}>Trạng thái</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '14px', background: getStatusInfo(selectedOrder.status).bg, color: getStatusInfo(selectedOrder.status).color, fontWeight: 900 }}>
                            {React.createElement(getStatusInfo(selectedOrder.status).icon, { size: 16 })}
                            {getStatusInfo(selectedOrder.status).label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
