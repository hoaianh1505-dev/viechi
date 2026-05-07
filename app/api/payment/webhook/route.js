import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

export async function POST(req) {
  try {
    await dbConnect();
    
    // Kiểm tra API Key để bảo mật Webhook
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.PAYMENT_WEBHOOK_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Lưu ý: Cấu trúc data phụ thuộc vào dịch vụ bro dùng (SePay, Casso, v.v.)
    // Ở đây tôi giả định cấu trúc cơ bản: { content: "THANHTOAN DONHANG ABCDEF", amount: 150000 }
    
    const description = data.content || data.description || '';
    const amount = data.amount || 0;

    // Tìm mã đơn hàng từ nội dung chuyển khoản (6 ký tự cuối của ID)
    const match = description.match(/DONHANG\s+([A-Z0-9]+)/i);
    if (!match) {
      return NextResponse.json({ message: 'Nội dung không hợp lệ' }, { status: 400 });
    }

    const shortOrderId = match[1].toUpperCase();

    // Tìm đơn hàng có mã khớp và trạng thái PENDING
    const order = await Order.findOne({ 
      orderCode: shortOrderId,
      status: 'PENDING'
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng tương ứng' }, { status: 404 });
    }

    // Kiểm tra số tiền (Cho phép sai số nhỏ hoặc kiểm tra khớp hoàn toàn)
    if (Math.abs(order.totalAmount - amount) > 100) {
      return NextResponse.json({ message: 'Số tiền không khớp' }, { status: 400 });
    }

    // Cập nhật trạng thái
    order.status = 'PROCESSING'; 
    order.paymentStatus = 'PAID'; 
    await order.save();

    // Xóa giỏ hàng của người dùng khi đã thanh toán xong
    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [], updatedAt: Date.now() },
      { returnDocument: 'after' }
    );

    console.log(`Đã thanh toán tự động và xóa giỏ hàng cho đơn hàng: ${order._id}`);

    return NextResponse.json({ success: true, message: 'Xác nhận thanh toán thành công' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
