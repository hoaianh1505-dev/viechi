import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await connectDB();
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ cart: [] });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userCart = await Cart.findOne({ user: decoded.id }).populate('items.productId');
    
    if (!userCart) return NextResponse.json({ cart: [] });

    // Format to match frontend structure, and filter out deleted products
    const formattedCart = userCart.items
      .filter(item => item.productId)
      .map(item => {
        const product = item.productId;
        return {
          ...product._doc,
          _id: product._id.toString(),
          quantity: item.quantity
        };
      });

    return NextResponse.json({ cart: formattedCart });
  } catch (error) {
    console.error('Lỗi GET Cart:', error);
    return NextResponse.json({ cart: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const { cart } = await req.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const dbItems = (cart || []).map(item => ({
      productId: item._id,
      quantity: item.quantity
    }));

    await Cart.findOneAndUpdate(
      { user: decoded.id },
      { items: dbItems },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ message: 'Đã lưu giỏ hàng vào Database' });
  } catch (error) {
    console.error('Lỗi POST Cart:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
