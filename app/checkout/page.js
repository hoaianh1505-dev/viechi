'use client';

import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
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

  const isInitialLoad = React.useRef(true);

  // Khôi phục dữ liệu từ localStorage khi load trang
  useEffect(() => {
    const savedData = localStorage.getItem('vietchi_checkout_form');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Lỗi khôi phục form:', e);
      }
    }
    // Đánh dấu đã xong lần đầu load sau 500ms để các effect khác không bị trigger reset
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 1000);
  }, []);

  // Lưu dữ liệu vào localStorage khi formData thay đổi
  useEffect(() => {
    localStorage.setItem('vietchi_checkout_form', JSON.stringify(formData));
  }, [formData]);

  // Redirect if cart is empty - Đợi cart load xong mới check
  useEffect(() => {
    if (!isCartLoading && !orderSuccess && cart.length === 0) {
      router.push('/');
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
        setDistricts(data.districts);
        // Chỉ reset nếu KHÔNG PHẢI là lần đầu load trang
        if (!isInitialLoad.current) {
          setFormData(prev => ({ ...prev, district_code: '', ward: '', ward_code: '', city_detail: '' }));
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
        setWards(data.wards);
        // Chỉ reset nếu KHÔNG PHẢI là lần đầu load trang
        if (!isInitialLoad.current) {
          setFormData(prev => ({ ...prev, ward: '', ward_code: '' }));
        }
      });
  }, [formData.district_code]);

  // Calculate Shipping Fee from DB or specific province fee
  useEffect(() => {
    const calculateFee = async () => {
      const threshold = settings?.freeShippingThreshold || 0;
      const defaultFee = settings?.shippingFee || 0;

      // Ưu tiên kiểm tra Free Ship theo ngưỡng trước
      if (threshold > 0 && cartTotal >= threshold) {
        setShippingFee(0);
        return;
      }

      if (formData.province_code) {
        try {
          const res = await fetch(`/api/shipping/${formData.province_code}`);
          const data = await res.json();
          
          // Nếu có phí riêng (data.fee !== null) thì lấy, không thì lấy mặc định
          if (data && data.fee !== null) {
            setShippingFee(data.fee);
          } else {
            setShippingFee(defaultFee);
          }
        } catch (e) {
          setShippingFee(defaultFee);
        }
      } else {
        setShippingFee(defaultFee);
      }
    };

    calculateFee();
  }, [cartTotal, settings, formData.province_code]);

  const finalTotal = cartTotal + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.city_detail || !formData.ward) {
      return toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            ...formData,
            fullAddress: `${formData.address}, ${formData.ward}, ${formData.city_detail}, ${formData.city}`
          },
          items: cart.map(item => ({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image
          })),
          totalAmount: finalTotal,
          paymentMethod: formData.paymentMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.orderId);
        setOrderCode(data.orderCode);
        setServerOrderData({ totalAmount: finalTotal }); // Khóa số tiền ngay lập tức
        
        // Nếu là COD thì xóa giỏ hàng và form ngay
        if (formData.paymentMethod === 'COD') {
          clearCart();
          localStorage.removeItem('vietchi_checkout_form');
          toast.success('Đặt hàng thành công!');
        }
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const [isPaid, setIsPaid] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [serverOrderData, setServerOrderData] = useState(null);

  // Polling order status for automated payment confirmation
  useEffect(() => {
    let interval;
    if (orderSuccess && formData.paymentMethod === 'BANK_TRANSFER' && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${orderSuccess}`);
          if (res.ok) {
            const data = await res.json();
            setServerOrderData(data); // Lưu dữ liệu đơn hàng từ server
            if (data.paymentStatus === 'PAID' || data.status !== 'PENDING') {
              setIsPaid(true);
              clearInterval(interval);
              
              // Đã thanh toán xong -> Giờ mới xóa giỏ hàng và form
              clearCart();
              localStorage.removeItem('vietchi_checkout_form');
              
              toast.success('Xác nhận đã nhận được thanh toán!', { icon: '💰', duration: 2000 });
              
              // Tự động chuyển hướng về trang chủ sau 2 giây
              setTimeout(() => {
                router.push('/');
              }, 2000);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [orderSuccess, formData.paymentMethod, isPaid, clearCart]);

  if (orderSuccess) {
    // Lấy số tiền từ đơn hàng server (nếu có) để tránh lỗi khi F5 giỏ hàng trống
    const displayTotal = serverOrderData?.totalAmount || finalTotal;
    
    const qrUrl = formData.paymentMethod === 'BANK_TRANSFER' && settings?.bankAccount 
      ? `https://img.vietqr.io/image/${settings.bankName}-${settings.bankAccount}-compact.png?amount=${displayTotal}&addInfo=THANHTOAN DONHANG ${orderCode}&accountName=${encodeURIComponent(settings.bankOwner)}`
      : null;

    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            maxWidth: '500px', width: '100%', background: '#fff', 
            padding: '3rem 2rem', borderRadius: '32px', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--border-card)'
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

          {isPaid ? (
            <div style={{ background: '#f0fdf4', padding: '2rem', borderRadius: '24px', marginBottom: '2rem', border: '1.5px solid #b91c1c10' }}>
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Hệ thống đã nhận được tiền!</div>
              <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '1rem' }}>VietChi đang chuẩn bị hàng và sẽ giao đến bạn trong thời gian sớm nhất.</p>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, padding: '0.5rem', background: '#dcfce7', borderRadius: '10px', display: 'inline-block' }}>
                🚀 Đang chuyển hướng về trang chủ sau 5 giây...
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '16px', fontWeight: 800, textDecoration: 'none' }}>
                  Tiếp tục mua sắm
                </Link>
                <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                  Xem lịch sử đơn hàng
                </Link>
              </div>
            </div>
          ) : qrUrl ? (
            <>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: '10px', right: '10px', 
                  background: 'var(--primary)', color: '#fff', 
                  fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: '20px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span className="pulse-dot"></span> Đang chờ thanh toán...
                </div>
                
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>Quét mã QR để thanh toán ngay:</p>
                <img src={qrUrl} alt="Payment QR" style={{ width: '200px', height: '200px', borderRadius: '12px', margin: '0 auto', display: 'block', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                
                <div style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}><span>Tổng thanh toán:</span> <b style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{displayTotal.toLocaleString()}đ</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}><span>Nội dung CK:</span> <b style={{ background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px dashed #f59e0b' }}>THANHTOAN DONHANG {orderCode}</b></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>* Vui lòng không đóng trang này cho đến khi thanh toán được xác nhận.</p>
                <button 
                  onClick={async () => {
                    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này và quay lại không?')) {
                      await fetch(`/api/orders/${orderSuccess}/cancel`, { method: 'POST' });
                      setOrderSuccess(null);
                    }
                  }}
                  style={{ background: '#fff', border: '1.5px solid #fee2e2', color: '#ef4444', padding: '0.85rem', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy đơn hàng & Quay lại
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem', textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Truck size={24} color="#0369a1" />
                <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>Đơn hàng của bạn sẽ sớm được nhân viên VietChi liên hệ xác nhận và giao tận nơi.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '16px', fontWeight: 800, textDecoration: 'none' }}>
                  Tiếp tục mua sắm
                </Link>
                <Link href="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                  Xem lịch sử đơn hàng
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0 5rem' }}>
      <div className="container">
        <header style={{ marginBottom: '2rem' }}>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Quay lại giỏ hàng
          </button>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>Thanh toán đơn hàng</h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="admin-grid-layout">
          
          {/* Left: Shipping Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}><MapPin size={18} /></div>
                Thông tin giao hàng
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="form-grid">
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Họ và tên người nhận</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Số điện thoại</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="tel"
                      placeholder="VD: 0909xxxxxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Tỉnh / Thành phố</label>
                  <select
                    value={formData.province_code}
                    onChange={e => {
                      const selected = provinces.find(p => String(p.code) === e.target.value);
                      setFormData({...formData, province_code: e.target.value, city: selected?.name || ''});
                    }}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Quận / Huyện</label>
                  <select
                    value={formData.district_code}
                    disabled={!formData.province_code}
                    onChange={e => {
                      const selected = districts.find(d => String(d.code) === e.target.value);
                      setFormData({...formData, district_code: e.target.value, city_detail: selected?.name || ''});
                    }}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: formData.province_code ? '#f8fafc' : '#f1f5f9', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Phường / Xã</label>
                  <select
                    value={formData.ward_code}
                    disabled={!formData.district_code}
                    onChange={e => {
                      const selected = wards.find(w => String(w.code) === e.target.value);
                      setFormData({...formData, ward_code: e.target.value, ward: selected?.name || ''});
                    }}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: formData.district_code ? '#f8fafc' : '#f1f5f9', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Số nhà, Tên đường</label>
                  <input
                    type="text"
                    placeholder="VD: 123 Đường 3/2"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Ghi chú thêm (Không bắt buộc)</label>
                  <textarea
                    rows={3}
                    placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', resize: 'none' }}
                  />
                </div>
              </div>
            </section>

            <section style={{ background: '#fff', padding: '2rem', borderRadius: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}><CreditCard size={18} /></div>
                Phương thức thanh toán
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '16px', 
                  border: `2px solid ${formData.paymentMethod === 'COD' ? 'var(--primary)' : '#f1f5f9'}`,
                  background: formData.paymentMethod === 'COD' ? 'var(--primary-light)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={formData.paymentMethod === 'COD'}
                    onChange={() => setFormData({...formData, paymentMethod: 'COD'})}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>Thanh toán khi nhận hàng (COD)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bạn sẽ thanh toán bằng tiền mặt khi shipper giao hàng tới.</div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '16px', 
                  border: `2px solid ${formData.paymentMethod === 'BANK_TRANSFER' ? 'var(--primary)' : '#f1f5f9'}`,
                  background: formData.paymentMethod === 'BANK_TRANSFER' ? 'var(--primary-light)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={formData.paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setFormData({...formData, paymentMethod: 'BANK_TRANSFER'})}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#1e293b' }}>Chuyển khoản Ngân hàng (VietQR)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quét mã QR để thanh toán nhanh chóng và an toàn.</div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'var(--text-main)', padding: '2rem', borderRadius: '32px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <ShoppingBag size={20} /> Tóm tắt đơn hàng
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {cart.map((item) => (
                  <div key={item._id || item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{item.quantity} x {item.price?.toLocaleString()}đ</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{(item.price * item.quantity).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span style={{ color: '#22c55e', fontWeight: 800 }}>Miễn phí</span>
                  ) : (
                    <span style={{ fontWeight: 700 }}>{shippingFee.toLocaleString()}đ</span>
                  )}
                </div>
                {shippingFee > 0 && settings?.freeShippingThreshold > 0 && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
                    (Miễn phí ship cho đơn từ {settings.freeShippingThreshold.toLocaleString()}đ)
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--primary)' }}>
                  <span>Tổng cộng</span>
                  <span>{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                style={{ 
                  width: '100%', padding: '1.2rem', borderRadius: '18px', 
                  background: 'var(--gradient)', color: '#fff', border: 'none',
                  fontSize: '1.1rem', fontWeight: 900, marginTop: '2rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  boxShadow: '0 10px 25px rgba(212, 96, 10, 0.3)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'} <ChevronRight size={20} />
              </button>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', justifyContent: 'center' }}>
                <ShieldCheck size={14} /> Giao dịch bảo mật & an toàn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
