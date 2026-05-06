'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Truck, Phone, User, MapPin, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingFees, setShippingFees] = useState([]);
  const [currentFee, setCurrentFee] = useState(0);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data));
    
    fetch('/api/shipping')
      .then(res => res.json())
      .then(data => setShippingFees(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (form.province) {
      const pCode = provinces.find(p => p.name === form.province)?.code;
      if (pCode) {
        fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setDistricts(data.districts);
            setForm(prev => ({ ...prev, district: '', ward: '' }));
          });
      }
      
      const feeObj = shippingFees.find(f => f.province === form.province);
      setCurrentFee(feeObj ? feeObj.fee : 0);
    }
  }, [form.province, provinces, shippingFees]);

  useEffect(() => {
    if (form.district) {
      const dCode = districts.find(d => d.name === form.district)?.code;
      if (dCode) {
        fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setWards(data.wards);
            setForm(prev => ({ ...prev, ward: '' }));
          });
      }
    }
  }, [form.district, districts]);

  if (cart.length === 0 && !success) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Giỏ hàng của bạn đang trống!</h2>
        <button onClick={() => router.push('/')} className="btn btn-primary">Quay lại mua sắm</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullAddress = `${form.address}, ${form.ward}, ${form.district}, ${form.province}`;
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          image: item.image
        })),
        totalAmount: cartTotal + currentFee,
        shippingFee: currentFee,
        shippingInfo: { ...form, address: fullAddress },
        paymentMethod
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đặt hàng thất bại');

      if (paymentMethod === 'VNPAY') {
        const payRes = await fetch('/api/payment/vnpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId })
        });
        const payData = await payRes.json();
        if (payData.paymentUrl) {
          window.location.href = payData.paymentUrl;
          return;
        }
      }

      setSuccess(true);
      clearCart();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Đặt hàng thành công!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}> Đơn hàng đã được ghi nhận. Phí ship: {currentFee.toLocaleString()}đ.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Quay lại trang chủ</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-section)', minHeight: '90vh', padding: '3rem 0' }}>
      <div className="container">
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Truck size={24} color="var(--primary)" /> Thông tin giao hàng
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input required className="input" placeholder="Họ và tên người nhận" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                <input required className="input" placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <select required className="input" value={form.province} onChange={e => setForm({...form, province: e.target.value})} style={{ background: '#fff', fontSize: '0.8rem' }}>
                    <option value="">Tỉnh/Thành</option>
                    {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                  <select required className="input" value={form.district} onChange={e => setForm({...form, district: e.target.value})} disabled={!districts.length} style={{ background: '#fff', fontSize: '0.8rem' }}>
                    <option value="">Quận/Huyện</option>
                    {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                  </select>
                  <select required className="input" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} disabled={!wards.length} style={{ background: '#fff', fontSize: '0.8rem' }}>
                    <option value="">Phường/Xã</option>
                    {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                  </select>
                </div>
                <input required className="input" placeholder="Số nhà, tên đường..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <textarea rows={3} className="input" placeholder="Ghi chú (không bắt buộc)" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
                
                {/* Payment Method */}
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Phương thức thanh toán</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { id: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck },
                      { id: 'VNPAY', label: 'Thanh toán Online qua VNPay', icon: CreditCard },
                    ].map(method => (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        style={{ 
                          padding: '1rem', 
                          borderRadius: '12px', 
                          border: `2px solid ${paymentMethod === method.id ? 'var(--primary)' : 'var(--border-card)'}`,
                          background: paymentMethod === method.id ? 'var(--primary-light)' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '20px', height: '20px', borderRadius: '50%', 
                          border: `2px solid ${paymentMethod === method.id ? 'var(--primary)' : '#cbd5e1'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {paymentMethod === method.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
                        </div>
                        <method.icon size={20} color={paymentMethod === method.id ? 'var(--primary)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: paymentMethod === method.id ? 'var(--text-main)' : 'var(--text-muted)' }}>{method.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                  {loading ? 'Đang xử lý...' : paymentMethod === 'VNPAY' ? 'Thanh toán ngay' : 'Xác nhận đặt hàng'}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={24} color="var(--primary)" /> Tóm tắt đơn hàng
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity}{item.unit} x {item.price.toLocaleString()}đ</p>
                    </div>
                    <span style={{ fontWeight: 800 }}>{(item.price * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                  <span>{cartTotal.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí ship ({form.province || 'chưa chọn'}):</span>
                  <span style={{ fontWeight: 700, color: currentFee > 0 ? 'var(--primary)' : '#22c55e' }}>{currentFee > 0 ? `${currentFee.toLocaleString()}đ` : 'Miễn phí'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid var(--border-card)' }}>
                  <span style={{ fontWeight: 800 }}>Tổng tiền:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{(cartTotal + currentFee).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
