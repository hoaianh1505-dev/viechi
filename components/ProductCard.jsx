'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { Eye, ImageOff, ShoppingCart, Lock, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { getId, contact } = useProducts();
  const { addToCart } = useCart();
  const { user } = useUser();
  const pid = getId(product);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{ cursor: 'pointer', height: '100%' }}
    >
      <div className="card" style={{ 
        overflow: 'hidden', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        background: '#fff',
        transition: 'box-shadow 0.3s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'}
      >
        <Link href={`/product/${pid}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
          {/* Image Container with Overlay */}
          <div style={{ position: 'relative', paddingTop: '100%', background: '#f8fafc', overflow: 'hidden' }}>
            <motion.img
              src={product.image || 'https://via.placeholder.com/400?text=No+Image'}
              alt={product.name}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Badges */}
            <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 2 }}>
              <span style={{ 
                background: 'var(--gradient)', color: '#fff', 
                padding: '0.25rem 0.7rem', borderRadius: '7px', 
                fontSize: '0.6rem', fontWeight: 900,
                boxShadow: '0 4px 10px rgba(212,96,10,0.3)',
                textTransform: 'uppercase'
              }}>
                Mới về
              </span>
              <span style={{ 
                background: 'rgba(255,255,255,0.9)', color: '#1e293b', 
                padding: '0.25rem 0.7rem', borderRadius: '7px', 
                fontSize: '0.6rem', fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(5px)'
              }}>
                {product.category}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ padding: '1rem 0.85rem' }}>
            <h3 style={{ 
              fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', lineHeight: '1.4', height: '2.6rem'
            }}>
              {product.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.6rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#fbbf24" color="#fbbf24" />)}
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginLeft: '0.2rem' }}>(4.9)</span>
            </div>
            <p style={{ 
              color: '#64748b', fontSize: '0.75rem', display: '-webkit-box', 
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', 
              height: '2.1rem', lineHeight: '1.4'
            }}>
              {product.description || 'Sản phẩm đặc sản cao cấp, tuyển chọn kỹ lưỡng từ nguyên liệu sạch.'}
            </p>
          </div>
        </Link>

        {/* Footer with Price and Actions */}
        <div style={{ padding: '0 1rem 1.25rem', marginTop: 'auto' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            paddingTop: '1rem', borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}>
                {product.price?.toLocaleString('vi-VN')}đ
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>trên {product.unit || 'kg'}</span>
            </div>
            
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
              style={{ 
                width: '44px', height: '44px', borderRadius: '14px', 
                background: user ? 'var(--primary-light)' : '#f1f5f9',
                color: user ? 'var(--primary)' : '#94a3b8',
                border: user ? '1px solid rgba(212,96,10,0.1)' : '1px solid #e2e8f0',
                cursor: user ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: user ? '0 4px 10px rgba(212,96,10,0.1)' : 'none'
              }}
              onMouseEnter={e => { if(user) { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if(user) { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; } }}
            >
              {user ? <ShoppingCart size={20} /> : <Lock size={18} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
