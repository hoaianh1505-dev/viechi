import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import Order from "@/models/Order";
import User from "@/models/User";

// Sử dụng bí danh 'latest' để đảm bảo tương thích với mọi loại Key
const MODEL_NAME = "gemini-flash-latest"; 

async function callGemini(apiKey, prompt) {
  // Sử dụng endpoint v1beta cho các model mới nhất
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function POST(req) {
  try {
    const { messages, user: currentUser } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ role: "model", content: "Thiếu API Key!" });
    }

    await dbConnect();
    
    // Lấy dữ liệu cơ bản
    const [products, settings] = await Promise.all([
      Product.find({}).lean(),
      Settings.findOne({}).lean()
    ]);
    
    let adminContext = "";
    const isAdmin = currentUser?.role === 'admin';

    // Nếu là Admin, nạp thêm dữ liệu "mật"
    if (isAdmin) {
      const [totalOrders, pendingOrders, recentOrders, totalUsers] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
        User.countDocuments()
      ]);

      const revenueRes = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = revenueRes[0]?.total || 0;

      adminContext = `
        CHẾ ĐỘ QUẢN TRỊ VIÊN ĐANG BẬT:
        Bạn đang nói chuyện với CHỦ CỬA HÀNG (Admin). Bạn có quyền truy cập dữ liệu kinh doanh:
        - Tổng số khách hàng: ${totalUsers}
        - Tổng số đơn hàng: ${totalOrders}
        - Đơn hàng đang chờ xử lý: ${pendingOrders}
        - Tổng doanh thu (hoàn tất): ${totalRevenue.toLocaleString()}đ
        - 5 đơn hàng gần nhất: ${recentOrders.map(o => `Đơn #${o._id.toString().slice(-5)} - ${o.totalAmount.toLocaleString()}đ (${o.status})`).join(", ")}
        
        Hãy sẵn sàng báo cáo và tư vấn chiến lược kinh doanh cho chủ shop một cách chuyên nghiệp.
      `;
    }
    
    const productContext = products.map(p => 
      `- **${p.name}**: ${p.price?.toLocaleString()}đ/${p.unit || 'kg'}. Tồn kho: ${p.stock || 'Sẵn hàng'}.`
    ).join("\n");

    const shopName = settings?.siteName || 'VietChi';
    const aiRole = settings?.aiRole || 'Chuyên gia tư vấn hải sản khô nhiệt tình.';

    const systemPrompt = `
      ${adminContext}

      BỐI CẢNH & NHÂN VẬT:
      Bạn là **SIÊU TRỢ LÝ VIETCHI AI** - Một chuyên gia am hiểu sâu sắc về hải sản khô, ẩm thực vùng miền và dinh dưỡng.
      - Tên: VietChi AI Assistant.
      - Tính cách: Hào sảng, thật thà, tinh tế, luôn đặt lợi ích của khách lên hàng đầu (đúng chất người Kiên Giang).
      - Chuyên môn: Tư vấn chọn khô theo khẩu vị, hướng dẫn chế biến món ngon (gỏi, rim, nướng...), tư vấn quà biếu và bảo quản.

      DANH SÁCH SẢN PHẨM:
      ${productContext}

      QUY TẮC VÀNG (BẮT BUỘC TUÂN THỦ):
      1. TRUNG THỰC TUYỆT ĐỐI: Chỉ nói đúng những gì có trong danh sách sản phẩm. KHÔNG phóng đại, KHÔNG "nổ" về công dụng hay chất lượng nếu không có dữ liệu.
      2. LỄ PHÉP & ĐÚNG MỰC: Luôn dùng "Dạ", "Thưa", "Dạ anh/chị...". Xưng hô lễ phép, khiêm tốn đúng chất người miền Tây phục vụ khách.
      3. NGẮN GỌN & TRỌNG TÂM: Trả lời thẳng vào câu hỏi. Tuyệt đối không nói lan man. Mỗi câu trả lời chỉ nên từ 1-3 câu ngắn.
      4. KHÔNG BIẾT THÌ NÓI KHÔNG BIẾT: Nếu sản phẩm không có hoặc thông tin không rõ, hãy xin lỗi lễ phép và hẹn khách khi khác hoặc tư vấn món tương tự (nếu có).
      5. KHÔNG CHÀO HỎI LẶP LẠI: Vào thẳng nội dung cần trả lời nếu đang trong mạch hội thoại.
      
      Phong cách: Một người em/người cháu trong nhà đang tư vấn đặc sản cho người thân một cách chân thành nhất.

      Khách hàng hỏi: ${userMessage}
    `;

    const result = await callGemini(apiKey, systemPrompt);
    
    if (result.ok) {
      const aiText = result.data.candidates?.[0]?.content?.parts?.[0]?.text 
        || "Mình đang suy nghĩ chút, bạn hỏi lại nhé! 😊";
      return NextResponse.json({ role: "model", content: aiText });
    } else {
      console.error("Gemini Error:", result.data);
      throw new Error(result.data.error?.message || "AI Error");
    }

  } catch (error) {
    console.error("Chatbot Error:", error.message);
    return NextResponse.json({ 
      role: "model", 
      content: "Xin lỗi bạn, hệ thống AI đang bận chút xíu! 🙏 Bạn nhắn lại sau vài giây nha!" 
    });
  }
}
