'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { Eye, ImageOff, ShoppingCart, Lock } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { getId, contact } = useProducts();
  const { addToCart } = useCart();
  const { user } = useUser();
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
          <div className="card-info" style={{ padding: '0.85rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.1rem' }}>
              {product.description || 'Đặc sản khô hải sản thơm ngon, chất lượng cao từ VietChi.'}
            </p>
          </div>
        </Link>

        {/* Price & Action (Dưới cùng) */}
        <div style={{ padding: '0 0.75rem 0.75rem', marginTop: 'auto' }}>
          <div className="card-footer" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingTop: '0.65rem', 
            borderTop: '1px solid var(--border-card)',
            gap: '0.4rem',
            flexWrap: 'wrap'
          }}>
            <div className="price-tag" style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                {product.price?.toLocaleString('vi-VN')}đ
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>/{product.unit || 'kg'}</span>
            </div>
            
            <div className="action-btns" style={{ display: 'flex', gap: '0.6rem', flex: 1 }}>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                className="btn btn-ghost"
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  minWidth: 'auto', 
                  borderRadius: '10px', 
                  border: `1.5px solid ${user ? 'var(--primary)' : 'var(--text-dim)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: user ? 'var(--primary-light)' : '#f1f5f9',
                  color: user ? 'var(--primary)' : 'var(--text-dim)',
                  opacity: user ? 1 : 0.8
                }}
                title={user ? "Thêm vào giỏ hàng" : "Đăng nhập để mua hàng"}
              >
                {user ? <ShoppingCart size={16} /> : <Lock size={14} />}
              </button>

              <Link
                href={`/product/${pid}`}
                className="btn btn-primary"
                style={{ 
                  flex: 1,
                  padding: '0.5rem 1rem', 
                  fontSize: '0.82rem', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(212,96,10,0.15)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <Eye size={15} /> <span className="hide-mobile">Xem chi tiết</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
