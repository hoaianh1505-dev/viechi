import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const shippingList = await Shipping.find({}).sort({ provinceName: 1 });
    return NextResponse.json(shippingList);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải danh sách phí ship' }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const { provinceName, provinceCode, fee } = await req.json();
    
    const shipping = await Shipping.findOneAndUpdate(
      { provinceCode },
      { provinceName, fee },
      { upsert: true, returnDocument: 'after' }
    );
    
    return NextResponse.json(shipping);
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật phí ship' }, { status: 500 });
  }
}
