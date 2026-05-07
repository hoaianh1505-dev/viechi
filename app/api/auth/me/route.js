import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const token = cookieStore.get('vietchi_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingInfo: user.shippingInfo || {}
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
