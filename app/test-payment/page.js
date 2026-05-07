'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Send, CheckCircle2 } from 'lucide-react';

export default function TestPaymentPage() {
  const [orderCode, setOrderCode] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    if (!orderCode || !amount) return toast.error('Vui lòng nhập đủ thông tin');
    
    setLoading(true);
    try {
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `THANHTOAN DONHANG ${orderCode.toUpperCase()}`,
          amount: parseFloat(amount)
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Gửi tín hiệu thanh toán thành công!');
      } else {
        toast.error(data.message || 'Lỗi xử lý');
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: '#fff', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CreditCard size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Giả lập Thanh toán</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Dùng để test tính năng tự động hoàn thành đơn hàng</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>MÃ ĐƠN HÀNG (6 ký tự cuối)</label>
            <input 
              type="text" 
              placeholder="VD: ABCDEF"
              value={orderCode}
              onChange={e => setOrderCode(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem' }}>SỐ TIỀN THANH TOÁN</label>
            <input 
              type="number" 
              placeholder="VD: 150000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}
            />
          </div>

          <button 
            onClick={handleSimulate}
            disabled={loading}
            style={{ 
              width: '100%', padding: '1rem', borderRadius: '16px', background: 'var(--gradient)', color: '#fff', border: 'none',
              fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
          >
            {loading ? 'Đang gửi...' : 'Xác nhận Đã chuyển tiền'} <Send size={18} />
          </button>

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', fontSize: '0.8rem', color: '#0369a1' }}>
            <b>Hướng dẫn:</b> Đặt một đơn hàng -> Copy 6 ký tự cuối mã đơn hàng -> Nhập vào đây kèm số tiền -> Bấm nút. Quay lại trang Checkout sẽ thấy nó tự động nhảy sang Thành công!
          </div>
        </div>
      </div>
    </div>
  );
}
