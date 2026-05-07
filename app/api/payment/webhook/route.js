import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

export async function POST(req) {
  try {
    await dbConnect();
    
    const data = await req.json();
    const apiKey = req.headers.get('x-api-key');
    console.log('--- WEBHOOK DEBUG ---');
    console.log('Header x-api-key nhận được:', apiKey);
    console.log('Data nhận được:', JSON.stringify(data, null, 2));
    
    // Tạm thời tắt kiểm tra API Key để test
    /*
    if (apiKey !== process.env.PAYMENT_WEBHOOK_KEY) {
      console.error('Báo lỗi: API Key không khớp!');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    */
    console.log('Webhook nhận dữ liệu:', data);
    
    const description = data.content || data.description || '';
    const amount = Number(data.amount || 0);

    // Tìm mã đơn hàng từ nội dung chuyển khoản
    const match = description.match(/DONHANG\s+([A-Z0-9]+)/i);
    if (!match) {
      console.warn('Không tìm thấy mã đơn hàng trong nội dung:', description);
      return NextResponse.json({ message: 'Nội dung không hợp lệ' }, { status: 400 });
    }

    const shortOrderId = match[1].toUpperCase();
    console.log('Đang tìm đơn hàng với mã:', shortOrderId);

    // Tìm đơn hàng có mã khớp và trạng thái PENDING
    const order = await Order.findOne({ 
      orderCode: shortOrderId,
      status: 'PENDING'
    });

    if (!order) {
      console.warn('Không tìm thấy đơn hàng PENDING với mã:', shortOrderId);
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng tương ứng' }, { status: 404 });
    }

    // Kiểm tra số tiền (Chấp nhận nếu chuyển bằng hoặc nhiều hơn số tiền đơn hàng)
    if (amount < order.totalAmount) {
      console.warn(`Số tiền không đủ. Yêu cầu: ${order.totalAmount}, Nhận: ${amount}`);
      return NextResponse.json({ message: 'Số tiền không khớp' }, { status: 400 });
    }

    // Cập nhật trạng thái
    order.status = 'PROCESSING'; 
    order.paymentStatus = 'PAID'; 
    await order.save();
    console.log('Cập nhật trạng thái đơn hàng thành công:', shortOrderId);

    // Xóa giỏ hàng của người dùng khi đã thanh toán xong
    try {
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], updatedAt: Date.now() },
        { upsert: true }
      );
      console.log('Đã xóa giỏ hàng cho user:', order.user);
    } catch (cartErr) {
      console.error('Lỗi khi xóa giỏ hàng (không nghiêm trọng):', cartErr);
    }

    return NextResponse.json({ success: true, message: 'Xác nhận thanh toán thành công' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
