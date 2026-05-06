import { ProductProvider } from '@/context/ProductContext';
import { UserProvider } from '@/context/UserContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ChatBot from '@/components/ChatBot';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import './App.css';

export const metadata = {
  title: 'VietChi — Đặc sản hải sản khô cao cấp',
  description: 'Chuyên cung cấp các loại hải sản khô thượng hạng, hương vị truyền thống, giao hàng toàn quốc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster position="top-center" reverseOrder={false} />
        <UserProvider>
        <ProductProvider>
          <CartProvider>
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <CartDrawer />
              <ChatBot />
              <main style={{ flex: 1 }}>
                {children}
              </main>

              <footer style={{ 
                background: '#fff', 
                borderTop: '1px solid var(--border-card)', 
                padding: '4rem 0 2rem', 
                marginTop: 'auto' 
              }}>
                <div className="container">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '3rem',
                    marginBottom: '3rem'
                  }}>
                    {/* Brand Section */}
                    <div style={{ gridColumn: 'span 1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'var(--gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem' }}>V</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>VietChi</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Mang hương vị biển cả truyền thống đến mọi gian bếp Việt. Cam kết chất lượng thượng hạng, không chất bảo quản.
                      </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem' }}>Sản phẩm</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Tất cả sản phẩm</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Khô cá đặc sản</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Mực & Tôm khô</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Quà tặng hải sản</a></li>
                      </ul>
                    </div>

                    {/* Policy */}
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem' }}>Chính sách</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Vận chuyển toàn quốc</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Đổi trả miễn phí</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Bảo mật thông tin</a></li>
                        <li><a href="#" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>Điều khoản dịch vụ</a></li>
                      </ul>
                    </div>

                    {/* Contact */}
                    <div>
                      <h4 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1rem' }}>Liên hệ</h4>
                      <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                        <strong>Hotline:</strong> 090 123 4567
                      </p>
                      <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                        <strong>Email:</strong> lienhe@vietchi.vn
                      </p>
                      <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        <strong>Địa chỉ:</strong> TP. Rạch Giá, Kiên Giang
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    borderTop: '1px solid var(--border-card)', 
                    paddingTop: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      © {new Date().getFullYear()} <strong style={{ color: 'var(--primary)' }}>VietChi</strong> — Tinh hoa hải sản Việt
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Giao hàng toàn quốc</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Đã thông báo Bộ Công Thương</span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </CartProvider>
        </ProductProvider>
        </UserProvider>
      </body>
    </html>
  );
}
