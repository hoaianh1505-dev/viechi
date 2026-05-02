import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ShippingFee from '@/models/ShippingFee';
import jwt from 'jsonwebtoken';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

    await ShippingFee.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Đã xóa phí ship' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
