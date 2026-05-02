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

    // Format to match frontend structure
    const formattedCart = userCart.items.map(item => {
      if (!item.productId) return null;
      return {
        ...item.productId._doc,
        quantity: item.quantity
      };
    }).filter(Boolean);

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

    const dbItems = cart.map(item => ({
      productId: item._id,
      quantity: item.quantity
    }));

    await Cart.findOneAndUpdate(
      { user: decoded.id },
      { items: dbItems },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Đã cập nhật giỏ hàng' });
  } catch (error) {
    console.error('Lỗi POST Cart:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
