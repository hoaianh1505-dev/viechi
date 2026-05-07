import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // user or admin
  
  // Thông tin giao hàng mặc định
  shippingInfo: {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    province: { type: String, default: '' },
    province_code: { type: String, default: '' },
    district: { type: String, default: '' },
    district_code: { type: String, default: '' },
    ward: { type: String, default: '' },
    ward_code: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  
  cart: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
