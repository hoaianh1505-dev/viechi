import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ShippingFee from '@/models/ShippingFee';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    await connectDB();
    const fees = await ShippingFee.find({});
    return NextResponse.json(fees);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

    const { province, fee } = await req.json();

    const updated = await ShippingFee.findOneAndUpdate(
      { province },
      { fee },
      { upsert: true, new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
