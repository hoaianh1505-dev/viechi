import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { items, totalAmount, shippingFee, shippingInfo } = body;

    // Check for user token if available
    const token = req.cookies.get('vietchi_token')?.value;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      shippingFee: shippingFee || 0,
      shippingInfo,
      status: 'pending',
      paymentMethod: 'COD'
    });

    return NextResponse.json({ message: 'Đặt hàng thành công', orderId: order._id });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let orders;
    if (decoded.role === 'admin') {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
