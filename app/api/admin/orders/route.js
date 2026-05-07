import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vietchi_token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    if (!await checkAdmin()) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all orders from all users, newest first
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi tải đơn hàng' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    if (!await checkAdmin()) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status } = await req.json();
    
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { returnDocument: 'after' }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi cập nhật trạng thái' }, { status: 500 });
  }
}
