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

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToProducts = (e) => {
    e.preventDefault();
    if (isScrolling) return;
    setIsScrolling(true);

    // Nếu ảnh chưa load xong, ta đợi một chút (tối đa 1s) rồi mới cuộn
    const performScroll = () => {
      const element = document.getElementById('products-section');
      if (element) {
        const offset = 80; // Trừ đi chiều cao Navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsScrolling(false);
    };

    if (!imageLoaded) {
      setTimeout(performScroll, 500); // Đợi 500ms cho ảnh kịp hiện
    } else {
      performScroll();
    }
  };

  useEffect(() => {
    setImageLoaded(false); // Reset mỗi khi đổi banner
  }, [current]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const currentBanner = banners[current % banners.length];

  return (
    <div className="hero-banner" style={{ 
      position: 'relative', 
      height: '420px', 
      borderRadius: '32px', 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, #fff3ea 0%, #ffffff 100%)',
      border: '1px solid rgba(212, 96, 10, 0.1)',
      marginBottom: '2.5rem',
      boxShadow: '0 20px 50px rgba(212, 96, 10, 0.08)'
    }}>
      {/* Decorative Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, Math.random() * -30, 0],
            x: [0, Math.random() * 20, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${10 + Math.random() * 30}px`,
            height: `${10 + Math.random() * 30}px`,
            background: 'var(--gradient)',
            borderRadius: '50%',
            filter: 'blur(10px)',
            zIndex: 1
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hero-split"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: typeof window !== 'undefined' && window.innerWidth < 768 ? '2rem' : '0 5rem',
            textAlign: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'left',
            gap: '2rem'
          }}
        >
          {/* Content Side */}
          <div style={{ zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-start' }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: 'var(--primary)',
                fontWeight: 900,
                fontSize: '0.8rem',
                marginBottom: '1.2rem',
                padding: '0.4rem 1rem',
                background: 'var(--primary-light)',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                border: '1px solid rgba(212, 96, 10, 0.1)'
              }}
            >
              <Star size={14} fill="var(--primary)" /> {currentBanner.tag}
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ 
                fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? '2.2rem' : '3.5rem', 
                fontWeight: 900, 
                color: '#1e293b', 
                lineHeight: 1.05, 
                marginBottom: '1.2rem',
                letterSpacing: '-1.5px',
                background: 'linear-gradient(90deg, #1e293b, #d4600a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {currentBanner.title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ 
                fontSize: '1.1rem', 
                color: '#64748b', 
                marginBottom: '2.5rem', 
                lineHeight: 1.7,
                maxWidth: '500px',
                fontWeight: 500
              }}
            >
              {currentBanner.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button 
                onClick={scrollToProducts}
                disabled={isScrolling}
                style={{ 
                  padding: '1.2rem 3.5rem', 
                  borderRadius: '24px', 
                  fontSize: '1.1rem', 
                  fontWeight: 900, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  background: 'var(--gradient)',
                  color: '#fff',
                  boxShadow: '0 15px 40px rgba(212, 96, 10, 0.4)',
                  border: 'none',
                  cursor: isScrolling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {isScrolling ? 'Đang chuẩn bị...' : 'Mua sắm ngay'} <ArrowRight size={22} />
              </button>
            </motion.div>
          </div>

          {/* Image Side */}
          {currentBanner.image && (typeof window === 'undefined' || window.innerWidth >= 768) && (
            <div style={{ position: 'relative', flex: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                position: 'absolute', 
                width: '320px', height: '320px', 
                borderRadius: '50%', 
                background: 'radial-gradient(circle, #ffe2cc 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
              }} />
              
              <motion.div
                initial={{ rotate: 5, scale: 0.9, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ 
                  zIndex: 1,
                  width: '380px', height: '300px',
                  borderRadius: '32px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                  border: '10px solid #fff'
                }}
              >
                <img 
                  src={currentBanner.image} 
                  alt="Banner" 
                  onLoad={() => setImageLoaded(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </motion.div>

              {/* Floating Status Badge */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: '10%', right: '5%',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '1rem 1.5rem', borderRadius: '20px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  zIndex: 2, border: '1px solid rgba(255,255,255,0.5)'
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>Hàng sẵn kho</span>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation - Hidden on Mobile */}
      {banners.length > 1 && (typeof window !== 'undefined' && window.innerWidth >= 768) && (
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
