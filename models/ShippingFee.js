import mongoose from 'mongoose';

const ShippingFeeSchema = new mongoose.Schema({
  province: { type: String, required: true, unique: true },
  fee: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.models.ShippingFee || mongoose.model('ShippingFee', ShippingFeeSchema);
