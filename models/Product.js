import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  gallery:     { type: [String], default: [] },
  category:    { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
