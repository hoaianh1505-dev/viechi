'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';
  const isFail = status === 'fail';

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-section)',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          textAlign: 'center', 
          padding: '3rem 2rem' 
        }}
      >
        {isSuccess ? (
          <>
            <div style={{ color: '#22c55e', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={80} style={{ margin: '0 auto' }} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Thanh toán thành công!</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Cảm ơn bạn đã tin tưởng VietChi. Đơn hàng của bạn đang được chúng tôi chuẩn bị và sẽ sớm được giao đến bạn.
            </p>
            {orderId && (
              <div style={{ background: 'var(--bg-section)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Mã đơn hàng: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
              {isFail ? <XCircle size={80} style={{ margin: '0 auto' }} /> : <AlertCircle size={80} style={{ margin: '0 auto' }} />}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>
              {isFail ? 'Thanh toán thất bại' : 'Có lỗi xảy ra'}
            </h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {message || 'Giao dịch không thành công. Vui lòng kiểm tra lại số dư tài khoản hoặc thử lại sau.'}
            </p>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => router.push('/orders')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <ShoppingBag size={18} /> Xem đơn hàng của tôi
          </button>
          <button 
            onClick={() => router.push('/')}
            className="btn btn-ghost"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={18} /> Quay lại trang chủ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '10rem' }}>Đang tải kết quả...</div>}>
      <ResultContent />
    </Suspense>
  );
}
