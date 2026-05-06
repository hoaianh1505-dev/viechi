import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('vietchi_token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function PUT(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  const { id } = await params;
  try {
    await dbConnect();
    const body = await req.json();
    const banner = await Banner.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật banner' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  const { id } = await params;
  try {
    await dbConnect();
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Đã xóa banner' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa banner' }, { status: 500 });
  }
}
