'use client';

import React, { useEffect, useRef } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useSettings } from '@/context/SettingsContext';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import { motion, useInView } from 'framer-motion';
import { Fish, ShieldCheck, Truck, Headphones, Award, Users, Map, Star, ShoppingBag, Sparkles, ArrowRight, Heart, Zap, Package, Phone } from 'lucide-react';

// Scroll-reveal wrapper
const Reveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const { products, loading } = useProducts();
  const { settings } = useSettings();

  useEffect(() => {
    // Tự động cuộn xuống sản phẩm sau khi load xong 1.5s
    const timer = setTimeout(() => {
      const section = document.getElementById('products-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        height: '70vh', gap: '1.5rem' 
      }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ 
            width: '60px', height: '60px', borderRadius: '18px', 
            background: 'var(--gradient)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(212,96,10,0.25)'
          }}
        >
          <Fish size={32} color="#fff" />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {settings?.siteName || 'VietChi'} đang chuẩn bị...
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vui lòng đợi trong giây lát nhé!</p>
        </div>
      </div>
    );
  }

  const trustItems = ['Hàng chính hãng 100%', '✦', 'Giao hàng toàn quốc', '✦', 'Đổi trả trong 7 ngày', '✦', 'Thanh toán an toàn', '✦', 'Hỗ trợ 24/7', '✦'];

  return (
    <div>
      {/* ===== HERO BANNER ===== */}
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <HeroBanner />
      </div>

      {/* ===== FEATURED CATEGORIES PROMAX ===== */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            gap: '1.25rem', 
            overflowX: 'auto', 
            padding: '0.5rem 0.2rem 1.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }} className="hide-scrollbar">
            {[
              { label: 'Khô Cá Đặc Sản', icon: Fish, color: '#d4600a', bg: '#fff7ed', desc: 'Đậm đà vị biển' },
              { label: 'Khô Mực Loại 1', icon: Sparkles, color: '#0d9488', bg: '#f0fdfa', desc: 'Thơm ngon, dai ngọt' },
              { label: 'Tôm Khô Thượng Hạng', icon: Zap, color: '#7c3aed', bg: '#f5f3ff', desc: 'Thịt chắc, màu đỏ tự nhiên' },
              { label: 'Quà Biếu Cao Cấp', icon: Award, color: '#e11d48', bg: '#fff1f2', desc: 'Sang trọng & ý nghĩa' },
              { label: 'Ưu Đãi Hôm Nay', icon: ShoppingBag, color: '#b45309', bg: '#fffbeb', desc: 'Giảm giá tới 30%' },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                style={{
                  flex: '0 0 auto',
                  width: '200px',
                  padding: '1.5rem',
                  borderRadius: '24px',
                  background: '#fff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.8rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: cat.bg,
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${cat.color}15`
                }}>
                  <cat.icon size={28} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{cat.label}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{cat.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST MARQUEE ===== */}
      <div className="hide-mobile" style={{ 
        overflow: 'hidden', 
        background: '#1c0f06',
        padding: '0.9rem 0',
        position: 'relative'
      }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', width: 'max-content' }}
        >
          {[...trustItems, ...trustItems, ...trustItems].map((item, i) => (
            <span key={i} style={{ 
              color: item === '✦' ? 'var(--primary)' : 'rgba(255,255,255,0.7)', 
              fontSize: item === '✦' ? '0.6rem' : '0.8rem', 
              fontWeight: 700, 
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ===== PRODUCT SECTION ===== */}
      <section id="products-section" style={{ background: 'var(--bg)', padding: '4rem 0' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--primary-light)', padding: '0.4rem 1.2rem', 
                borderRadius: '999px', marginBottom: '1rem',
                border: '1px solid rgba(212,96,10,0.15)'
              }}>
                <Sparkles size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tuyển chọn đặc biệt</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.1 }}>
                Sản phẩm <span style={{ color: 'var(--primary)' }}>nổi bật</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                {products.length} sản phẩm chất lượng cao · Giao hàng tận nơi toàn quốc
              </p>
            </div>
          </Reveal>

          {products.length > 0 ? (
            <div className="product-grid">
              {products.map((product, index) => (
                <motion.div
                  key={product._id || product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '5rem 2rem',
              background: 'var(--bg-section)', borderRadius: '24px',
              border: '1.5px dashed var(--border-card)',
            }}>
              <Fish size={44} style={{ color: 'var(--text-dim)', margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)' }}>Hiện chưa có sản phẩm nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="hide-mobile" style={{ padding: '5rem 0', background: '#fff', overflow: 'hidden' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#f0fdfa', padding: '0.4rem 1.2rem', 
                borderRadius: '999px', marginBottom: '1rem',
                border: '1px solid rgba(13,148,136,0.15)'
              }}>
                <Zap size={14} color="var(--teal)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cam kết chất lượng</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem' }}>
                Vì sao chọn <span style={{ color: 'var(--primary)' }}>{settings?.siteName || 'VietChi'}?</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>Mỗi sản phẩm đều mang trong mình câu chuyện của biển cả và sự tận tâm.</p>
            </div>
          </Reveal>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {[
              { icon: ShieldCheck, title: 'Chất Lượng Thượng Hạng', desc: 'Tuyển chọn kỹ lưỡng, đảm bảo tiêu chuẩn cao nhất từ nguồn nguyên liệu.', color: '#d4600a', bg: '#fff7ed' },
              { icon: Truck, title: 'Giao Hàng Siêu Tốc', desc: 'Đóng gói cẩn thận, vận chuyển nhanh chóng đến 63 tỉnh thành.', color: '#0d9488', bg: '#f0fdfa' },
              { icon: Award, title: 'Uy Tín Hàng Đầu', desc: 'Hàng ngàn khách hàng tin tưởng và quay lại mua sắm.', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: Heart, title: 'Hỗ Trợ Tận Tâm', desc: 'Đội ngũ CSKH luôn sẵn sàng lắng nghe và đồng hành cùng bạn.', color: '#e11d48', bg: '#fff1f2' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ 
                    padding: '2.5rem 2rem', borderRadius: '28px',
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    cursor: 'default',
                    transition: 'border-color 0.3s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = item.color + '30'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                >
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '18px', 
                    background: item.bg, color: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <item.icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS + BRAND STORY ===== */}
      <section id="about" className="hide-mobile" style={{ padding: '5rem 0', background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <Reveal>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--accent-light)', padding: '0.4rem 1.2rem', 
                  borderRadius: '999px', marginBottom: '1.5rem',
                  border: '1px solid rgba(245,158,11,0.2)'
                }}>
                  <Star size={14} color="var(--accent)" fill="var(--accent)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px' }}>Câu chuyện thương hiệu</span>
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                  {settings?.siteName || 'VietChi'} — <br />
                  <span style={{ color: 'var(--primary)' }}>Khẳng định đẳng cấp</span>
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {settings?.brandStory || 'Chúng tôi tự hào mang đến những sản phẩm tốt nhất cho khách hàng.'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a href="#products-section" className="btn btn-primary" style={{ padding: '0.9rem 2rem', borderRadius: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Mua sắm ngay <ArrowRight size={18} />
                  </a>
                  {settings?.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} className="btn btn-outline" style={{ padding: '0.9rem 2rem', borderRadius: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} /> {settings.contactPhone}
                    </a>
                  )}
                </div>
              </Reveal>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                {[
                  { label: 'Khách hàng', value: '5,000+', icon: Users, color: '#096dd9', bg: '#e6f7ff' },
                  { label: 'Sản phẩm', value: `${products.length}+`, icon: Package, color: '#d4600a', bg: '#fff7e6' },
                  { label: 'Tỉnh thành', value: '63', icon: Map, color: '#389e0d', bg: '#f6ffed' },
                  { label: 'Đánh giá', value: '4.9/5', icon: Star, color: '#722ed1', bg: '#f9f0ff' },
                ].map((stat, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.02 }}
                      style={{ 
                        background: '#fff', padding: '1.75rem', borderRadius: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        textAlign: 'center', border: '1px solid var(--border-card)',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '14px', 
                        background: stat.bg, color: stat.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                      }}>
                        <stat.icon size={22} />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.3rem', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS PROMAX ===== */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-section)', overflow: 'hidden' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#fff', padding: '0.4rem 1.2rem', 
                borderRadius: '999px', marginBottom: '1.2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9'
              }}>
                <Heart size={14} color="#e11d48" fill="#e11d48" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Khách hàng tin yêu</span>
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.8rem' }}>Đánh giá từ <span style={{ color: 'var(--primary)' }}>người dùng</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Hơn 10,000+ khách hàng đã hài lòng với chất lượng dịch vụ của chúng tôi.</p>
            </div>
          </Reveal>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {[
              { name: 'Anh Tuấn', role: 'Đầu bếp khách sạn', content: 'Khô cá ở đây rất tươi, độ mặn vừa phải, phơi rất khéo. Tôi thường xuyên đặt cho nhà hàng của mình.', avatar: 'https://i.pravatar.cc/150?u=1' },
              { name: 'Chị Lan', role: 'Nội trợ', content: 'Tôm khô to, ngọt tự nhiên, không hề có phẩm màu. Cả nhà mình ai cũng khen ngon khi nấu canh.', avatar: 'https://i.pravatar.cc/150?u=2' },
              { name: 'Bác Hùng', role: 'Hưu trí', content: 'Dịch vụ giao hàng rất nhanh, đóng gói hút chân không cẩn thận, mang đi biếu quà rất sang trọng.', avatar: 'https://i.pravatar.cc/150?u=3' },
            ].map((review, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -10 }}
                  style={{
                    background: '#fff',
                    padding: '2.5rem',
                    borderRadius: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    border: '1px solid #f1f5f9',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1.2rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="var(--accent)" color="var(--accent)" />
                    ))}
                  </div>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#475569', 
                    lineHeight: 1.8, 
                    fontStyle: 'italic',
                    marginBottom: '2rem'
                  }}>
                    "{review.content}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={review.avatar} alt={review.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.1rem' }}>{review.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <Reveal>
            <div style={{
              background: 'var(--gradient)',
              borderRadius: '32px',
              padding: '4rem 3rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ marginBottom: '1.5rem' }}
                >
                  <Sparkles size={40} color="rgba(255,255,255,0.9)" />
                </motion.div>
                <h2 className="hero-title" style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
                  Bạn đã sẵn sàng trải nghiệm?
                </h2>
                <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  Đặt hàng ngay hôm nay để nhận ưu đãi đặc biệt dành riêng cho khách hàng mới!
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="#products-section" style={{
                    padding: '1rem 2.5rem', borderRadius: '16px',
                    background: '#fff', color: 'var(--primary)',
                    fontWeight: 900, fontSize: '1rem',
                    textDecoration: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    transition: 'all 0.2s'
                  }}>
                    <ShoppingBag size={20} /> Mua sắm ngay
                  </a>
                  {settings?.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} style={{
                      padding: '1rem 2.5rem', borderRadius: '16px',
                      background: 'rgba(255,255,255,0.15)', color: '#fff',
                      fontWeight: 800, fontSize: '1rem',
                      textDecoration: 'none',
                      border: '2px solid rgba(255,255,255,0.3)',
                      display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                      transition: 'all 0.2s'
                    }}>
                      <Phone size={18} /> Gọi ngay
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
