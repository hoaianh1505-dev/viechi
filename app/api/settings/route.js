import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải cấu hình' }, { status: 500 });
  }
}
