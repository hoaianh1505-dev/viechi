'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { Eye, ImageOff } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { getId } = useProducts();
  const pid = getId(product);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      style={{ cursor: 'pointer' }}
    >
      <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Link bao quanh ảnh và tiêu đề */}
        <Link href={`/product/${pid}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
          {/* Image Container */}
          <div style={{ position: 'relative', paddingTop: '100%', background: 'var(--bg-section)', overflow: 'hidden' }}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageOff size={32} style={{ color: 'var(--text-dim)' }} />
              </div>
            )}
            
            {/* Category Badge */}
            <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
              <span className="badge badge-accent" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {product.category}
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.1rem' }}>
              {product.description || 'Đặc sản khô hải sản thơm ngon, chất lượng cao từ miền Tây.'}
            </p>
          </div>
        </Link>

        {/* Price & Action (Dưới cùng) */}
        <div style={{ padding: '0 1rem 1rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-card)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.05rem' }}>
              {product.price?.toLocaleString('vi-VN')}đ
            </span>
            <Link
              href={`/product/${pid}`}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={e => e.stopPropagation()}
            >
              <Eye size={13} /> Xem
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
