import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'VietChi' },
  siteTitle: { type: String, default: 'Đặc sản hải sản khô cao cấp' },
  logo: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  address: { type: String, default: '' },
  brandStory: { type: String, default: '' },
  aiRole: { type: String, default: 'Bạn là trợ lý bán hàng thân thiện.' },
  banners: [{
    title: String,
    subtitle: String,
    image: String,
    tag: String,
    link: String
  }]
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
