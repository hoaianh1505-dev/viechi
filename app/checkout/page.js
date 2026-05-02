'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Truck, Phone, User, MapPin, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';

const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    province: 'Hà Nội',
    address: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          image: item.image
        })),
        totalAmount: cartTotal,
        shippingInfo: {
          ...form,
          address: `${form.address}, ${form.province}`
        }
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error('Đặt hàng thất bại');
      
      setSuccess(true);
      clearCart();
    } catch (err) {
      alert(err.message);
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}> Đơn hàng của bạn đã được tiếp nhận. Bạn có thể theo dõi trạng thái tại mục **Đơn hàng của tôi**.</p>
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
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Truck size={24} color="var(--primary)" /> Thông tin giao hàng
              </h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Họ và tên người nhận</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input required className="input" style={{ paddingLeft: '2.8rem' }} placeholder="Nguyễn Văn A" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Số điện thoại</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                      <input required className="input" style={{ paddingLeft: '2.8rem' }} placeholder="0901234567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tỉnh / Thành phố</label>
                    <select required className="input" value={form.province} onChange={e => setForm({...form, province: e.target.value})} style={{ background: '#fff' }}>
                      {VIETNAM_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Địa chỉ chi tiết (Số nhà, đường...)</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input required className="input" style={{ paddingLeft: '2.8rem' }} placeholder="Số nhà, tên đường, phường/xã..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ghi chú đơn hàng (không bắt buộc)</label>
                  <textarea rows={3} className="input" style={{ resize: 'none' }} placeholder="VD: Giao giờ hành chính, gọi trước khi đến..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
                </div>

                <div style={{ padding: '1.25rem', background: 'var(--bg-section)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}>
                    <CreditCard size={18} color="var(--primary)" /> Phương thức thanh toán
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Thanh toán khi nhận hàng (COD)</p>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', justifyContent: 'center', marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(212,96,10,0.3)' }}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={24} color="var(--primary)" /> Tóm tắt đơn hàng
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={item.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.quantity}{item.unit || 'kg'} x {item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px dashed var(--border-card)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                  <span style={{ fontWeight: 700 }}>{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                  <span style={{ fontWeight: 700, color: '#22c55e' }}>Miễn phí</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Tổng tiền:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
