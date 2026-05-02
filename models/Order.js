import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional if guest checkout is allowed
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, default: 'kg' },
      image: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  shippingInfo: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String, default: '' }
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] 
  },
  paymentStatus: { type: String, default: 'unpaid', enum: ['unpaid', 'paid'] },
  paymentMethod: { type: String, default: 'COD' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
