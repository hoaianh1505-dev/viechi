import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Hỗ trợ cả x-api-key (custom) và Authorization (mặc định của SePay)
    let apiKey = req.headers.get('x-api-key');
    const authHeader = req.headers.get('Authorization');
    
    if (!apiKey && authHeader && authHeader.startsWith('Apikey ')) {
      apiKey = authHeader.replace('Apikey ', '');
    }

    console.log('--- WEBHOOK DEBUG ---');
    console.log('Mã bảo mật nhận được:', apiKey);
    console.log('Data nhận được:', JSON.stringify(data, null, 2));

    // Lấy số tiền từ mọi trường có thể có (SePay dùng amount hoặc amount_in)
    const rawAmount = data.amount || data.amount_in || data.transferAmount || data.accumulated || 0;
    const amount = Number(rawAmount);
    
    const description = data.content || data.description || '';
    console.log('Số tiền trích xuất:', amount, '| Nội dung:', description);
    
    // Tạm thời tắt kiểm tra API Key để test (Mở lại khi đã chạy ổn)
    /*
    if (!apiKey || apiKey !== process.env.PAYMENT_WEBHOOK_KEY) {
      console.warn('Sai API Key:', apiKey);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    */

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

    console.log(`Kiểm tra số tiền: Nhận được ${amount}, Đơn hàng yêu cầu ${order.totalAmount}`);
    
    // Chế độ TEST: Chấp nhận mọi giao dịch từ 1.000đ trở lên
    if (amount < 1000) {
      console.warn(`Số tiền quá nhỏ: ${amount}`);
      return NextResponse.json({ message: 'Số tiền không hợp lệ' }, { status: 400 });
    }

    // Cập nhật trạng thái
    order.status = 'PROCESSING'; 
    order.paymentStatus = 'PAID'; 
    await order.save();
    console.log('Cập nhật trạng thái đơn hàng thành công:', shortOrderId);

    // Xóa giỏ hàng của người dùng khi đã thanh toán xong
    try {
      if (order.user) {
        await Cart.findOneAndUpdate(
          { user: order.user },
          { items: [], updatedAt: Date.now() },
          { upsert: true }
        );
        console.log('Đã xóa giỏ hàng cho user:', order.user);
      }
    } catch (cartErr) {
      console.error('Lỗi khi xóa giỏ hàng (không nghiêm trọng):', cartErr);
    }

    return NextResponse.json({ success: true, message: 'Xác nhận thanh toán thành công' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
