'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import { 
  ArrowLeft, ShieldCheck, Truck, CreditCard, 
  MapPin, Phone, User, MessageSquare, CheckCircle2,
  ChevronRight, ShoppingBag, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, loading: isCartLoading } = useCart();
  const { user } = useUser();
  const { settings } = useSettings();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    city_detail: '',
    ward: '',
    province_code: '',
    district_code: '',
    ward_code: '',
    note: '',
    paymentMethod: 'COD'
  });

  const isInitialLoad = useRef(true);

  // 1. CHỈ KHÔI PHỤC DỮ LIỆU TỪ DATABASE (User Profile)
  useEffect(() => {
    if (user?.shippingInfo && Object.keys(user.shippingInfo).length > 0) {
      const info = user.shippingInfo;
      setFormData(prev => ({
        ...prev,
        fullName: info.fullName || user.name || prev.fullName,
        phone: info.phone || prev.phone,
        address: info.address || prev.address,
        city: info.province || info.city || prev.city,
        province_code: String(info.province_code || prev.province_code || ''),
        city_detail: info.district || info.city_detail || prev.city_detail,
        district_code: String(info.district_code || prev.district_code || ''),
        ward: info.ward || prev.ward,
        ward_code: String(info.ward_code || prev.ward_code || ''),
      }));
    }
    
    // Đánh dấu đã xong lần đầu load để tránh reset logic
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  // 2. SỬA LỖI REDIRECT KHI RESET (F5)
  useEffect(() => {
    // Chỉ kiểm tra redirect khi: 
    // - Đã load xong giỏ hàng (isCartLoading === false)
    // - Không phải vừa đặt hàng thành công (orderSuccess === null)
    if (!isCartLoading && !orderSuccess) {
      // Đợi thêm một chút (800ms) để chắc chắn state cart đã ổn định sau khi hydrations
      const checkRedirect = setTimeout(() => {
        if (cart.length === 0) {
          router.push('/');
        }
      }, 800);
      return () => clearTimeout(checkRedirect);
    }
  }, [cart, orderSuccess, isCartLoading]);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);

  // Fetch Provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (!formData.province_code) {
      setDistricts([]);
      return;
    }
    fetch(`https://provinces.open-api.vn/api/p/${formData.province_code}?depth=2`)
      .then(res => res.json())
      .then(data => {
        if (data.districts) {
          setDistricts(data.districts);
          if (formData.city_detail && !formData.district_code) {
            const found = data.districts.find(d => d.name === formData.city_detail);
            if (found) setFormData(prev => ({ ...prev, district_code: String(found.code) }));
          }
        }
      });
  }, [formData.province_code]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (!formData.district_code) {
      setWards([]);
      return;
    }
    fetch(`https://provinces.open-api.vn/api/d/${formData.district_code}?depth=2`)
      .then(res => res.json())
      .then(data => {
        if (data.wards) {
          setWards(data.wards);
          if (formData.ward && !formData.ward_code) {
            const found = data.wards.find(w => w.name === formData.ward);
            if (found) setFormData(prev => ({ ...prev, ward_code: String(found.code) }));
          }
        }
      });
  }, [formData.district_code]);

  // Calculate Shipping Fee
  useEffect(() => {
    if (cartTotal === 0) {
      setShippingFee(0);
      return;
    }
    if (settings?.freeShippingThreshold && cartTotal >= settings.freeShippingThreshold) {
      setShippingFee(0);
    } else {
      setShippingFee(settings?.shippingFee || 30000);
    }
  }, [cartTotal, settings, formData.city]);

  const displayTotal = cartTotal + shippingFee;
  const [orderCode, setOrderCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  // Kiểm tra trạng thái thanh toán cho đơn BANK_TRANSFER
  useEffect(() => {
    let interval;
    if (orderSuccess && formData.paymentMethod === 'BANK_TRANSFER' && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderSuccess}/status`);
          const data = await res.json();
          if (data.status === 'PAID') {
            setIsPaid(true);
            clearCart();
            clearInterval(interval);
            setTimeout(() => { router.push('/'); }, 5000);
          }
        } catch (e) { console.error('Lỗi check status:', e); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [orderSuccess, isPaid, formData.paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.province_code) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart,
        totalAmount: displayTotal,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province_code: formData.province_code,
          city_detail: formData.city_detail,
          district_code: formData.district_code,
          ward: formData.ward,
          ward_code: formData.ward_code
        },
        paymentMethod: formData.paymentMethod
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.orderId);
        setOrderCode(data.orderCode);
        
        if (formData.paymentMethod === 'COD') {
          clearCart();
          toast.success('Đặt hàng thành công!');
        } else {
          // Generate VietQR URL
          const amount = displayTotal;
          const addInfo = `THANHTOAN DONHANG ${data.orderCode}`;
          const url = `https://img.vietqr.io/image/${settings.bankName}-${settings.bankAccount}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(settings.bankOwner)}`;
          setQrUrl(url);
          toast.success('Vui lòng quét mã QR để thanh toán');
        }
      } else {
        toast.error(data.message || 'Lỗi khi đặt hàng');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ 
            maxWidth: '600px', width: '100%', background: '#fff', 
            padding: '3rem 2rem', borderRadius: '32px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
          }}
        >
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: isPaid ? '#f0fdf4' : '#eff6ff', color: isPaid ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            {isPaid ? <CheckCircle2 size={40} /> : <Clock size={40} className="animate-spin-slow" />}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1e293b' }}>
            {isPaid ? 'Thanh toán thành công!' : 'Đặt hàng thành công!'}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Mã đơn hàng: <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{orderCode}</span>
          </p>

          {qrUrl && !isPaid ? (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Quét mã QR để thanh toán:</p>
              <img src={qrUrl} alt="Payment QR" style={{ width: '220px', height: '220px', borderRadius: '12px', margin: '0 auto', display: 'block', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <div style={{ marginTop: '1.5rem', textAlign: 'left', fontSize: '0.85rem', background: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Số tiền:</span> <b style={{ color: 'var(--primary)' }}>{displayTotal.toLocaleString()}đ</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Nội dung:</span> <b style={{ color: '#0369a1' }}>THANHTOAN DONHANG {orderCode}</b></div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 600 }}>Chúng tôi sẽ sớm liên hệ xác nhận đơn hàng của bạn.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/" style={{ padding: '1rem', borderRadius: '16px', fontWeight: 800, textDecoration: 'none', background: 'var(--gradient)', color: '#fff' }}>Tiếp tục mua sắm</Link>
            <Link href="/my-orders" style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>Xem đơn hàng của tôi</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: isMobile ? '1rem 0 7rem' : '2rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, color: '#1e293b' }}>Thanh toán</h1>
        </header>

        <form onSubmit={handleSubmit} style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', 
          gap: isMobile ? '1.5rem' : '3rem', 
          alignItems: 'start' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}><MapPin size={20} /></div>
                Thông tin giao hàng
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Họ và tên người nhận</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text" required placeholder="VD: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Số điện thoại</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="tel" required placeholder="VD: 0909xxxxxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Tỉnh / Thành phố</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <select
                      required
                      value={formData.province_code}
                      onChange={e => {
                        const selected = provinces.find(p => String(p.code) === e.target.value);
                        setFormData({
                          ...formData, province_code: e.target.value, city: selected?.name || '',
                          district_code: '', city_detail: '', ward_code: '', ward: ''
                        });
                      }}
                      style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map(p => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
                    </select>
                    <ChevronRight size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Quận / Huyện</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <select
                      required
                      value={formData.district_code}
                      disabled={!formData.province_code}
                      onChange={e => {
                        const selected = districts.find(d => String(d.code) === e.target.value);
                        setFormData({
                          ...formData, district_code: e.target.value, city_detail: selected?.name || '',
                          ward_code: '', ward: ''
                        });
                      }}
                      style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: formData.province_code ? '#f8fafc' : '#f1f5f9', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => <option key={d.code} value={String(d.code)}>{d.name}</option>)}
                    </select>
                    <ChevronRight size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Phường / Xã</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <select
                      required
                      value={formData.ward_code}
                      disabled={!formData.district_code}
                      onChange={e => {
                        const selected = wards.find(w => String(w.code) === e.target.value);
                        setFormData({...formData, ward_code: e.target.value, ward: selected?.name || ''});
                      }}
                      style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: formData.district_code ? '#f8fafc' : '#f1f5f9', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => <option key={w.code} value={String(w.code)}>{w.name}</option>)}
                    </select>
                    <ChevronRight size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: '#94a3b8', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Số nhà, Tên đường</label>
                  <input
                    type="text" required placeholder="VD: 123 Đường 3/2"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: isMobile ? 'auto' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.6rem' }}>Ghi chú thêm</label>
                  <textarea
                    rows={3} placeholder="VD: Giao giờ hành chính..."
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '14px', border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, resize: 'none' }}
                  />
                </div>
              </div>
            </section>

            <section style={{ background: '#fff', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#fffbeb', color: '#d97706' }}><CreditCard size={20} /></div>
                Phương thức thanh toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['COD', 'BANK_TRANSFER'].map(method => (
                  <label key={method} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '20px', 
                    border: `2.5px solid ${formData.paymentMethod === method ? 'var(--primary)' : '#f1f5f9'}`,
                    background: formData.paymentMethod === method ? 'var(--primary-light)' : '#fff',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <input type="radio" checked={formData.paymentMethod === method} onChange={() => setFormData({...formData, paymentMethod: method})} style={{ width: '22px', height: '22px', accentColor: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.05rem' }}>{method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản VietQR'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{method === 'COD' ? 'Thanh toán tiền mặt cho shipper' : 'Quét mã QR để thanh toán nhanh'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div style={{ position: isMobile ? 'static' : 'sticky', top: '100px' }}>
            <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '32px', color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <ShoppingBag size={22} /> Tóm tắt đơn hàng
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                {cart.map(item => (
                  <div key={item._id || item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.quantity} x {item.price?.toLocaleString()}đ</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}><span>Tạm tính</span><span>{cartTotal.toLocaleString()}đ</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}><span>Phí ship</span><span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 900, marginTop: '0.5rem', color: '#f97316' }}>
                  <span>Tổng cộng</span><span>{displayTotal.toLocaleString()}đ</span>
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '1.2rem', borderRadius: '20px', background: 'var(--gradient)', color: '#fff', border: 'none', fontWeight: 900, fontSize: '1.1rem', marginTop: '2rem', cursor: 'pointer', boxShadow: '0 10px 30px rgba(212,96,10,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Xác nhận Đặt hàng <ChevronRight /></>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
