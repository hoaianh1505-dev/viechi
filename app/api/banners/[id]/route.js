import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const banner = await Banner.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!banner) return NextResponse.json({ error: 'Không tìm thấy banner' }, { status: 404 });
    return NextResponse.json(banner);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return NextResponse.json({ error: 'Không tìm thấy banner' }, { status: 404 });
    return NextResponse.json({ message: 'Đã xóa banner' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
