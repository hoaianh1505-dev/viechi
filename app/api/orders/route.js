import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vietchi_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, items, totalAmount, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Giỏ hàng trống' }, { status: 400 });
    }

    // Create Order
    const newOrder = await Order.create({
      user: user.id,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod,
      status: 'PENDING'
    });

    // Clear Cart after successful order
    await Cart.findOneAndUpdate(
      { user: user.id },
      { items: [], updatedAt: Date.now() }
    );

    return NextResponse.json({ 
      message: 'Đặt hàng thành công!', 
      orderId: newOrder._id 
    }, { status: 201 });

  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi đặt hàng' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user's orders, sorted by newest first
    const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi tải đơn hàng' }, { status: 500 });
  }
}
