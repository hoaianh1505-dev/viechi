'use client';

import React from 'react';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import { motion } from 'framer-motion';
import { Fish } from 'lucide-react';

export default function Home() {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span style={{ color: 'var(--text-muted)' }}>Đang tải...</span>
      </div>
    );
  }

  return (
    <div>
      {/* ===== HERO BANNER ===== */}
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <HeroBanner />
      </div>

      {/* ===== PRODUCT SECTION ===== */}
      <section style={{ background: 'var(--bg)', paddingBottom: '4rem' }}>
        <div className="container">
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Orange accent bar */}
              <div style={{ width: '4px', height: '28px', borderRadius: '4px', background: 'var(--gradient)' }} />
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1 }}>
                  Sản phẩm nổi bật
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                  {products.length} loại khô · Đặt hàng giao tận nơi
                </p>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
              gap: '1.25rem',
            }}>
              {products.map((product, index) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'var(--bg-section)',
              borderRadius: '20px',
              border: '1.5px dashed var(--border-card)',
            }}>
              <Fish size={44} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)' }}>Hiện chưa có sản phẩm nào. Vui lòng thêm trong trang Quản trị.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
