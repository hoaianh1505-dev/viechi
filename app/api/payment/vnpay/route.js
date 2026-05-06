import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { createPaymentUrl } from '@/lib/vnpay';

export async function POST(req) {
  try {
    await dbConnect();
    const { orderId } = await req.json();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Lấy IP của người dùng (có thể cần xử lý cho môi trường deploy)
    const ipAddr = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // Tạo URL thanh toán
    const paymentUrl = createPaymentUrl(order, ipAddr);

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('Lỗi thanh toán VNPay:', error);
    return NextResponse.json({ error: 'Lỗi khởi tạo thanh toán' }, { status: 500 });
  }
}
