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

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải banners' }, { status: 500 });
  }
}

export async function POST(req) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }
  try {
    await dbConnect();
    const body = await req.json();
    const banner = await Banner.create(body);
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo banner' }, { status: 500 });
  }
}
