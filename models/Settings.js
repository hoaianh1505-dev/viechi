import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'VietChi' },
  siteTitle: { type: String, default: 'Hải Sản Khô Thượng Hạng' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  
  // Contact Info
  contactEmail: { type: String, default: 'contact@vietchi.vn' },
  contactPhone: { type: String, default: '0909 123 456' },
  contactAddress: { type: String, default: 'Rạch Giá, Kiên Giang' },
  googleMapsLink: { type: String, default: '' },
  workingHours: { type: String, default: '8:00 - 21:00 (Thứ 2 - Chủ Nhật)' },

  // Social Links
  socialFacebook: { type: String, default: '' },
  socialInstagram: { type: String, default: '' },
  socialTiktok: { type: String, default: '' },
  socialYoutube: { type: String, default: '' },

  // Marketing
  announcementText: { type: String, default: 'Miễn phí vận chuyển cho đơn hàng trên 500k!' },
  announcementActive: { type: Boolean, default: true },
  
  // Content
  brandStory: { type: String, default: 'VietChi mang đến những mẻ cá tươi ngon nhất từ vùng biển Kiên Giang.' },
  footerText: { type: String, default: '© 2024 VietChi - Đặc Sản Kiên Giang. Bảo lưu mọi quyền.' },
  aiRole: { type: String, default: 'Chuyên gia tư vấn hải sản khô nhiệt tình.' },

  // Banners Array
  banners: {
    type: [{
      title: String,
      subtitle: String,
      image: String,
      tag: String,
      link: String
    }],
    default: [{
      tag: 'Đặc sản Kiên Giang',
      title: 'Hải Sản Khô Thượng Hạng',
      subtitle: 'Tuyển chọn từ những mẻ cá tươi ngon nhất, phơi nắng tự nhiên giữ trọn hương vị biển cả.',
      image: 'https://images.unsplash.com/photo-1544070078-a212eaa27b45?q=80&w=2069&auto=format&fit=crop',
      link: '#products-section'
    }]
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
