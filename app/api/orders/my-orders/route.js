import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vietchi_sieu_bao_mat_2024';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Lấy token từ cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('vietchi_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Giải mã token để lấy userId
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Tìm tất cả đơn hàng của User này
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng của tôi:', error);
    return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
  }
}
