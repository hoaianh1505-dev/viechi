'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'VietChi',
    siteTitle: 'Đặc sản hải sản khô cao cấp',
    logo: '',
    favicon: '',
    contactPhone: '0909 123 456',
    contactEmail: 'contact@vietchi.vn',
    contactAddress: 'Rạch Giá, Kiên Giang',
    googleMapsLink: '',
    workingHours: '8:00 - 21:00 (Thứ 2 - Chủ Nhật)',
    socialFacebook: '',
    socialInstagram: '',
    socialTiktok: '',
    socialYoutube: '',
    announcementText: 'Miễn phí vận chuyển cho đơn hàng trên 500k!',
    announcementActive: true,
    brandStory: 'Mang hương vị biển cả truyền thống đến mọi gian bếp Việt.',
    footerText: '© 2024 VietChi - Đặc Sản Kiên Giang. Bảo lưu mọi quyền.',
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
