'use client';

import React from 'react';
import { useProducts } from '@/context/ProductContext';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import { motion } from 'framer-motion';
import { Fish, ShieldCheck, Truck, Headphones, Award, Users, Map, Star, ShoppingBag } from 'lucide-react';

export default function Home() {
  const { products, loading } = useProducts();

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
            Đang chuẩn bị đặc sản...
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Vui lòng đợi trong giây lát nhé!
          </p>
        </div>
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
            <div className="product-grid">
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

      {/* ===== FEATURES SECTION ===== */}
      <section style={{ padding: '5rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {[
              { icon: ShieldCheck, title: 'Sạch & Tự Nhiên', desc: 'Sản phẩm được phơi thủ công, không dùng chất bảo quản.' },
              { icon: Truck, title: 'Giao Hàng Nhanh', desc: 'Vận chuyển toàn quốc, đóng gói cẩn thận, an toàn.' },
              { icon: Award, title: 'Chất Lượng Loại 1', desc: 'Tuyển chọn từ những mẻ khô ngon nhất vùng biển Kiên Giang.' },
              { icon: Headphones, title: 'Hỗ Trợ 24/7', desc: 'Luôn sẵn sàng tư vấn và giải đáp thắc mắc của khách hàng.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '20px', 
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 8px 20px rgba(212,96,10,0.1)'
                }}>
                  <item.icon size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.6rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / BRAND STORY ===== */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4rem', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ width: '50px', height: '4px', background: 'var(--gradient)', borderRadius: '2px', marginBottom: '1.5rem' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                VietChi — Gói trọn <br />
                <span style={{ color: 'var(--primary)' }}>tinh hoa biển Việt</span>
              </h2>
              <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Khởi nguồn từ tình yêu với những món khô truyền thống của quê hương Kiên Giang, VietChi mang đến cho bạn những sản phẩm hải sản khô thượng hạng. Chúng tôi cam kết giữ trọn hương vị nguyên bản thông qua quy trình phơi nắng tự nhiên và bảo quản khắt khe.
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn btn-primary" 
                style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}
              >
                Khám phá ngay
              </button>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1.25rem' 
              }}>
                {[
                  { label: 'Khách hàng', value: '5,000+', icon: Users, color: '#096dd9', bg: '#e6f7ff' },
                  { label: 'Sản phẩm', value: '50+', icon: ShoppingBag, color: '#d4600a', bg: '#fff7e6' },
                  { label: 'Tỉnh thành', value: '63', icon: Map, color: '#389e0d', bg: '#f6ffed' },
                  { label: 'Đánh giá', value: '4.9/5', icon: Star, color: '#722ed1', bg: '#f9f0ff' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    style={{ 
                      background: '#fff', padding: '1.5rem', borderRadius: '24px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      textAlign: 'center', border: '1px solid var(--border-card)'
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
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.2rem' }}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
