import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Fix for Next.js 15+
    const { status } = await req.json();

    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });

    return NextResponse.json({ message: 'Đã xóa đơn hàng' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
