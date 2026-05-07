import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { code } = await params;
    const shipping = await Shipping.findOne({ provinceCode: code });
    
    if (!shipping) {
      return NextResponse.json({ provinceCode: code, fee: null }); // null means use default
    }
    
    return NextResponse.json(shipping);
  } catch (error) {
    return NextResponse.json({ fee: 0 });
  }
}
