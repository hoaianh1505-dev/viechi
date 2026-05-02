import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find().sort({ createdAt: 1 });
    return NextResponse.json(banners);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Verify admin
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

    const body = await req.json();
    const banner = new Banner(body);
    await banner.save();
    return NextResponse.json(banner, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
