import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { status, paymentStatus } = await req.json();

    // Verify admin
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true }
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
