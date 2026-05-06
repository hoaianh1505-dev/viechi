'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Star } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const HeroBanner = () => {
  const { settings } = useSettings();
  const [current, setCurrent] = useState(0);

  const banners = settings?.banners?.length > 0 ? settings.banners : [
    {
      tag: 'Welcome',
      title: 'Chào mừng bạn đến với VietChi',
      subtitle: 'Khám phá những đặc sản thượng hạng từ biển cả.',
      image: 'https://images.unsplash.com/photo-1544070078-a212eaa27b45?q=80&w=2069&auto=format&fit=crop',
      link: '#products-section'
    }
  ];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const currentBanner = banners[current % banners.length];

  return (
    <div className="hero-banner" style={{ 
      position: 'relative', 
      height: '360px', 
      borderRadius: '32px', 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, #fff3ea 0%, #ffffff 100%)',
      border: '1px solid #ffe2cc',
      marginBottom: '2rem'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="hero-split"
          style={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: currentBanner.image ? '1.2fr 1fr' : '1fr',
            alignItems: 'center',
            padding: '0 4rem',
            textAlign: currentBanner.image ? 'left' : 'center'
          }}
        >
          {/* Content Side */}
          <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: currentBanner.image ? 'flex-start' : 'center' }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              <Star size={16} fill="var(--primary)" /> {currentBanner.tag}
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hero-title"
              style={{ 
                fontSize: '2.8rem', 
                fontWeight: 900, 
                color: '#1e293b', 
                lineHeight: 1.1, 
                marginBottom: '1rem',
                letterSpacing: '-1px'
              }}
            >
              {currentBanner.title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hero-subtitle"
              style={{ 
                fontSize: '1rem', 
                color: '#64748b', 
                marginBottom: '2rem', 
                lineHeight: 1.6,
                maxWidth: currentBanner.image ? '450px' : '650px'
              }}
            >
              {currentBanner.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a href={currentBanner.link} className="btn btn-primary" style={{ 
                padding: '1rem 2.5rem', 
                borderRadius: '16px', 
                fontSize: '1rem', 
                fontWeight: 800, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                boxShadow: '0 10px 25px rgba(212, 96, 10, 0.2)',
                textDecoration: 'none'
              }}>
                Mua Ngay <ArrowRight size={20} />
              </a>
            </motion.div>
          </div>

          {/* Image Side - ONLY IF IMAGE EXISTS */}
          {currentBanner.image && (
            <div className="hero-image-side" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Background Decorative Shapes */}
              <div style={{ 
                position: 'absolute', 
                width: '280px', 
                height: '280px', 
                borderRadius: '50%', 
                background: '#ffe2cc', 
                opacity: 0.5,
                zIndex: 0
              }} />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ 
                  zIndex: 1,
                  width: '320px',
                  height: '260px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '8px solid #fff'
                }}
              >
                <img 
                  src={currentBanner.image} 
                  alt="Banner" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '20%',
                  right: '10%',
                  background: '#fff',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  zIndex: 2
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>Đang bán chạy</span>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation - Small & Subtle */}
      {banners.length > 1 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '1.5rem', 
          right: '4rem', 
          display: 'flex', 
          gap: '0.75rem',
          zIndex: 3
        }}>
          <button onClick={prevSlide} style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #ffe2cc', background: '#fff', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
          <button onClick={nextSlide} style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #ffe2cc', background: '#fff', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
