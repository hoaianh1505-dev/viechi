import mongoose from 'mongoose';

const ShippingSchema = new mongoose.Schema({
  provinceName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  provinceCode: { 
    type: String, 
    required: true 
  },
  fee: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.models.Shipping || mongoose.model('Shipping', ShippingSchema);
