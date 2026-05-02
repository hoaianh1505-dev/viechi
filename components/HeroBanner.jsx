'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

const BG_GRADIENTS = [
  'linear-gradient(135deg, #7c2d12 0%, #d4600a 60%, #f59e0b 100%)',
  'linear-gradient(135deg, #065f46 0%, #0d9488 60%, #34d399 100%)',
  'linear-gradient(135deg, #78350f 0%, #b45309 60%, #d97706 100%)',
];

const HeroBanner = () => {
  const { banners } = useProducts();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const slides = banners && banners.length > 0 ? banners : [];

  const next = useCallback(() => {
    if (slides.length < 2) return;
    setDir(1); setIdx(p => (p + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length < 2) return;
    setDir(-1); setIdx(p => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[idx] || slides[0];
  const bg = BG_GRADIENTS[idx % BG_GRADIENTS.length];

  const variants = {
    enter: d => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  d => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="hero-banner" style={{
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      height: '240px',
      boxShadow: '0 10px 30px rgba(180,80,10,0.15)',
    }}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={idx}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
          style={{
            position: 'absolute', inset: 0,
            background: bg,
            display: 'flex',
            alignItems: 'center',
          }}
          className="hero-slide-content"
        >
          {/* Subtle pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)',
          }} />

          {/* Left: Text */}
          <div style={{ position: 'relative', zIndex: 2, padding: '0 4.5rem', maxWidth: '65%', flex: 1 }}>
            {slide.tag && (
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  padding: '0.15rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {slide.tag}
              </motion.span>
            )}

            <motion.h2
              className="hero-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.17 }}
              style={{
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '0.4rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {slide.title}
            </motion.h2>

            {slide.subtitle && (
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {slide.subtitle}
              </motion.p>
            )}
          </div>

          {/* Right: Image */}
          <div className="hero-image-container" style={{ position: 'relative', height: '100%', width: '35%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '4rem' }}>
            {slide.image ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.45 }}
                src={slide.image}
                alt={slide.title}
                style={{ height: '85%', width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                style={{ color: '#fff', textAlign: 'center' }}
              >
                <ImageOff size={56} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          {[{ fn: prev, icon: ChevronLeft, side: 'left' }, { fn: next, icon: ChevronRight, side: 'right' }].map(({ fn, icon: Icon, side }) => (
            <button
              key={side}
              onClick={fn}
              style={{
                position: 'absolute', [side]: '8px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <Icon size={16} />
            </button>
          ))}
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
              style={{
                width: i === idx ? '24px' : '7px', height: '7px',
                borderRadius: '999px',
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Progress */}
      {slides.length > 1 && (
        <motion.div
          key={idx}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
          style={{
            position: 'absolute', bottom: 0, left: 0,
            height: '3px', width: '100%',
            background: 'rgba(255,255,255,0.6)',
            transformOrigin: 'left',
          }}
        />
      )}
    </div>
  );
};

export default HeroBanner;
