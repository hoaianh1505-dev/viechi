import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
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

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await Order.findOne({ _id: id, user: user.id });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // CHỈ cho phép hủy khi đang PENDING
    if (order.status !== 'PENDING') {
      return NextResponse.json({ 
        message: 'Không thể hủy đơn hàng này vì đơn đang được xử lý hoặc đã giao.' 
      }, { status: 400 });
    }

    order.status = 'CANCELLED';
    await order.save();

    return NextResponse.json({ message: 'Đã hủy đơn hàng thành công' });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi hủy đơn' }, { status: 500 });
  }
}
