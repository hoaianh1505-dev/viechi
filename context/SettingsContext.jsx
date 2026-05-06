'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'VietChi',
    siteTitle: 'Đặc sản hải sản khô cao cấp',
    logo: '',
    contactPhone: '090 123 4567',
    contactEmail: 'contact@vietchi.vn',
    address: 'TP. Rạch Giá, Kiên Giang',
    brandStory: 'Mang hương vị biển cả truyền thống đến mọi gian bếp Việt. Cam kết chất lượng thượng hạng.',
    aiRole: 'Bạn là trợ lý bán hàng chuyên nghiệp của VietChi.',
    banners: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Lỗi tải cấu hình:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettingsLocally = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettingsLocally }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
