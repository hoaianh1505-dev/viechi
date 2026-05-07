import { ProductProvider } from '@/context/ProductContext';
import { UserProvider } from '@/context/UserContext';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import ClientLayout from '@/components/ClientLayout';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import './App.css';

export const metadata = {
  title: 'Hệ thống Quản lý Bán hàng Thông minh',
  description: 'Nền tảng thương mại điện tử linh hoạt, hỗ trợ đa ngành hàng.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            duration: 2000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <UserProvider>
          <SettingsProvider>
            <ProductProvider>
              <CartProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </CartProvider>
            </ProductProvider>
          </SettingsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
