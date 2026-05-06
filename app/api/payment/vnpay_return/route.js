import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyReturnUrl } from '@/lib/vnpay';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // 1. Kiểm tra chữ ký bảo mật
    const isValid = verifyReturnUrl({ ...params });
    
    const orderId = params['vnp_TxnRef'];
    const responseCode = params['vnp_ResponseCode']; // 00 là thành công

    if (!isValid) {
      return NextResponse.redirect(new URL('/payment/result?status=error&message=Chu ky khong hop le', req.url));
    }

    if (responseCode === '00') {
      // 2. Cập nhật trạng thái đơn hàng thành Đã thanh toán
      await Order.findByIdAndUpdate(orderId, { 
        paymentStatus: 'paid' 
      });
      
      return NextResponse.redirect(new URL(`/payment/result?status=success&orderId=${orderId}`, req.url));
    } else {
      return NextResponse.redirect(new URL(`/payment/result?status=fail&code=${responseCode}`, req.url));
    }

  } catch (error) {
    console.error('Lỗi xử lý kết quả VNPay:', error);
    return NextResponse.redirect(new URL('/payment/result?status=error', req.url));
  }
}
