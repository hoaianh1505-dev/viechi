import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    
    // Check if user is deleting themselves or an admin
    const user = await User.findById(id);
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Không thể xóa tài khoản quản trị' }, { status: 403 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa người dùng' }, { status: 500 });
  }
}
