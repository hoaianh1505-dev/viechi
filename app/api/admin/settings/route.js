import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Create with schema defaults (including default banner)
      settings = await Settings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải cấu hình' }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    let settings = await Settings.findOne({});
    
    if (settings) {
      settings = await Settings.findOneAndUpdate({}, body, { new: true });
    } else {
      settings = await Settings.create(body);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lưu cấu hình' }, { status: 500 });
  }
}
