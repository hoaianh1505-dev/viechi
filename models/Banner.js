import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  tag:      { type: String, default: '' },
  image:    { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
