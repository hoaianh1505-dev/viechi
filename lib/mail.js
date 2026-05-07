import nodemailer from 'nodemailer';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const sendOrderNotification = async (order, user, settings) => {
  const smtpUser = settings?.smtpUser || process.env.EMAIL_USER;
  const smtpPass = settings?.smtpPass || process.env.EMAIL_PASS;
  const adminEmail = settings?.adminNotificationEmail || process.env.ADMIN_EMAIL || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.error('❌ EMAIL ERROR: Chưa cấu hình SMTP trong Admin Settings!');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()}đ</td>
    </tr>
  `).join('');

  // 1. GỬI CHO ADMIN (Người bán)
  if (validateEmail(adminEmail)) {
    const adminOptions = {
      from: `"VietChi Hệ Thống" <${smtpUser}>`,
      to: adminEmail,
      subject: `🔔 ĐƠN HÀNG MỚI: #${order.orderCode} - ${user.name || 'Khách hàng'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
          <div style="background: #1e293b; padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 24px;">Bạn có đơn hàng mới!</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Mã đơn: <strong>#${order.orderCode}</strong></p>
          </div>
          <div style="padding: 25px;">
            <p><strong>Khách hàng:</strong> ${order.shippingAddress.fullName}</p>
            <p><strong>SĐT:</strong> ${order.shippingAddress.phone}</p>
            <p><strong>Tổng tiền:</strong> <span style="color: #d4600a; font-weight: 800;">${order.totalAmount.toLocaleString()}đ</span></p>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders" style="background: #f97316; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 700;">Xử lý ngay trên Admin</a>
            </div>
          </div>
        </div>
      `
    };
    transporter.sendMail(adminOptions).catch(err => console.error('Admin Email error:', err));
  }

  // 2. GỬI CHO KHÁCH HÀNG (Người mua)
  // Kiểm tra email khách hàng có hợp lệ không trước khi gửi
  if (user?.email && validateEmail(user.email)) {
    const customerOptions = {
      from: `"VietChi Đặc Sản" <${smtpUser}>`,
      to: user.email,
      subject: `📦 XÁC NHẬN ĐƠN HÀNG: #${order.orderCode} - Cảm ơn bạn đã ủng hộ!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4600a 0%, #f97316 100%); padding: 25px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 24px;">Cảm ơn ${order.shippingAddress.fullName}!</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">VietChi đã nhận được đơn hàng <strong>#${order.orderCode}</strong> của bạn.</p>
          </div>
          <div style="padding: 25px;">
            <p>Chào bạn, đơn hàng của bạn đang được chúng mình chuẩn bị và sẽ sớm giao đến tay bạn.</p>
            
            <h3 style="color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 10px; text-align: left; font-size: 14px;">Sản phẩm</th>
                  <th style="padding: 10px; text-align: center; font-size: 14px;">SL</th>
                  <th style="padding: 10px; text-align: right; font-size: 14px;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 20px 10px; text-align: right; font-weight: 800; font-size: 18px;">Tổng cộng:</td>
                  <td style="padding: 20px 10px; text-align: right; font-weight: 800; font-size: 18px; color: #d4600a;">${order.totalAmount.toLocaleString()}đ</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 30px; text-align: center; background: #f8fafc; padding: 20px; border-radius: 16px;">
              <p style="margin-bottom: 15px; font-weight: 700; color: #1e293b;">Bạn có thể theo dõi hành trình đơn hàng tại đây:</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/my-orders" style="background: #1e293b; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 700;">Xem đơn hàng của tôi</a>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
            Đội ngũ VietChi chân thành cảm ơn bạn!
          </div>
        </div>
      `
    };
    transporter.sendMail(customerOptions).catch(err => console.error('Customer Email error:', err));
  } else {
    console.log(`⚠️ Email khách hàng (${user?.email}) không hợp lệ hoặc là mail giả, bỏ qua gửi mail xác nhận.`);
  }
};
