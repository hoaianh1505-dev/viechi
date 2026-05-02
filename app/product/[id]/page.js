'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';
import {
  MessageCircle, Phone, ArrowLeft, ExternalLink,
  Tag, ZoomIn, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== Lightbox =====
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,5,0,0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: '42px', height: '42px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', zIndex: 10,
        }}
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: '1.4rem', left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600,
      }}>
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{
            position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          src={images[current]}
          alt=""
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '88vw', maxHeight: '86vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}
          onError={e => { e.target.src = 'https://via.placeholder.com/800x600/f5ebe0/d4600a?text=VietChi'; }}
        />
      </AnimatePresence>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{
            position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '0.5rem',
          padding: '0.5rem', borderRadius: '12px',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{
                width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                border: `2px solid ${i === current ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                padding: 0, cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s',
              }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.src = 'https://via.placeholder.com/52/f5ebe0/d4600a?text=K'} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default function ProductDetail() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { products, contact, getId } = useProducts();
  const [showContact, setShowContact] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const product = products.find(p => String(getId(p)) === String(id));
  const allImages = product ? [product.image, ...(product.gallery || [])].filter(Boolean) : [];
  const [activeIdx, setActiveIdx] = useState(0);

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '8rem 1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Không tìm thấy sản phẩm!</h2>
      <button onClick={() => router.push('/')} className="btn btn-primary">Quay lại trang chủ</button>
    </div>
  );

  const activeImage = allImages[activeIdx] || '';

  return (
    <div style={{ background: 'var(--bg-section)', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ paddingTop: '1.75rem' }}>
        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-muted)', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: '1.75rem', fontSize: '0.88rem',
            fontFamily: 'inherit', fontWeight: 600, padding: '0.4rem 0.85rem',
            borderRadius: '8px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '55% 1fr', gap: '2.5rem', alignItems: 'start' }}>
          {/* ===== LEFT: Images ===== */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
            {/* Main image - large */}
            <div
              className="card"
              style={{
                overflow: 'hidden',
                marginBottom: '0.8rem',
                position: 'relative',
                cursor: allImages.length > 0 ? 'zoom-in' : 'default',
                aspectRatio: '4/3',
              }}
              onClick={() => allImages.length > 0 && setLightboxIndex(activeIdx)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={activeImage}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/700x525/f5ebe0/d4600a?text=VietChi'; }}
                />
              </AnimatePresence>

              {/* Zoom hint */}
              {allImages.length > 0 && (
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: 'rgba(0,0,0,0.45)', borderRadius: '8px',
                  padding: '0.35rem 0.6rem',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}>
                  <ZoomIn size={14} /> Phóng to
                </div>
              )}

              {/* Image counter badge */}
              {allImages.length > 1 && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(0,0,0,0.5)', borderRadius: '20px',
                  padding: '0.25rem 0.65rem', color: '#fff',
                  fontSize: '0.72rem', fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                }}>
                  {activeIdx + 1}/{allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(allImages.length, 6)}, 1fr)`, gap: '0.5rem' }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden',
                      border: `2.5px solid ${i === activeIdx ? 'var(--primary)' : 'var(--border-card)'}`,
                      padding: 0, cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: i === activeIdx ? '0 0 0 2px rgba(212,96,10,0.25)' : 'none',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.src = 'https://via.placeholder.com/80/f5ebe0/d4600a?text=K'} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ===== RIGHT: Info ===== */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            {product.category && (
              <span className="badge badge-accent" style={{ marginBottom: '0.85rem', display: 'inline-block' }}>
                {product.category}
              </span>
            )}

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2, color: 'var(--text-main)' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.85rem 1.1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid rgba(212,96,10,0.2)' }}>
              <Tag size={17} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.2rem', marginBottom: '1.5rem', background: '#fff' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Mô tả sản phẩm
              </p>
              <p style={{ color: 'var(--text-sub)', lineHeight: 1.75, fontSize: '0.9rem' }}>
                {product.description}
              </p>
            </div>

            {allImages.length > 1 && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ZoomIn size={14} style={{ color: 'var(--primary)' }} />
                  Sản phẩm có <strong style={{ color: 'var(--primary)' }}>{allImages.length} ảnh</strong> · Bấm vào ảnh để xem lớn
                </p>
              </div>
            )}

            <button
              onClick={() => setShowContact(true)}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '0.9rem', justifyContent: 'center' }}
            >
              <MessageCircle size={18} /> Liên hệ mua hàng
            </button>
          </motion.div>
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={allImages}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* ===== CONTACT MODAL ===== */}
      <AnimatePresence>
        {showContact && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,6,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 16 }}
              className="card"
              style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>Liên hệ người bán</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={`tel:${contact.zalo}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', borderRadius: '12px', textDecoration: 'none', background: '#f0fdf4', border: '1.5px solid #86efac', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#22c55e'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#86efac'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><Phone size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Zalo / SĐT</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{contact.zalo}</div>
                    </div>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700 }}>GỌI NGAY</span>
                </a>

                <a href={contact.facebook} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', borderRadius: '12px', textDecoration: 'none', background: 'var(--primary-light)', border: '1.5px solid #fcd9b6', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#fcd9b6'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffe4cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><ExternalLink size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Facebook</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nhắn tin Messenger</div>
                    </div>
                  </div>
                  <span style={{ background: 'var(--primary)', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700 }}>TRUY CẬP</span>
                </a>
              </div>
              <button onClick={() => setShowContact(false)}
                style={{ marginTop: '1.5rem', width: '100%', textAlign: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
