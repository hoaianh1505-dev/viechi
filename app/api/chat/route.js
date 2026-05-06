import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        role: "model", 
        content: "Chào bạn! Hiện tại mình chưa được kết nối với 'bộ não' Gemini (Thiếu API Key trong .env). Bạn vui lòng bổ sung Key để mình có thể tư vấn cho bạn nhé! 🙏" 
      });
    }

    await dbConnect();
    const products = await Product.find({}).lean();
    
    const productContext = products.map(p => 
      `- **${p.name}**: ${p.price.toLocaleString()}đ/${p.unit || 'kg'}. Đặc điểm: ${p.description}`
    ).join("\n");

    const systemPrompt = `
      Bạn là **VietChi AI Advisor** - Chuyên gia tư vấn đặc sản của cửa hàng VietChi. 
      Phong cách: Thân thiện, nhiệt tình, thật thà, đậm chất người miền Tây Nam Bộ (Kiên Giang).
      
      Danh sách sản phẩm chúng ta đang có:
      ${productContext}

      Quy tắc tư vấn:
      1. Khách hỏi về sản phẩm: Hãy tư vấn nhiệt tình, nêu bật ưu điểm (phơi nắng tự nhiên, không chất bảo quản, hàng loại 1).
      2. Khách hỏi về đơn hàng: Hãy bảo khách cung cấp "Mã đơn hàng" (thường bắt đầu bằng # và có trong phần Lịch sử đơn hàng hoặc email). Sau đó hướng dẫn khách chờ bộ phận CSKH kiểm tra trong vài phút.
      3. Khách hỏi về vận chuyển: VietChi giao hàng toàn quốc. Phí ship sẽ được hệ thống tính toán chính xác khi khách nhập địa chỉ ở trang Thanh toán.
      4. Luôn kết thúc bằng một lời chúc hoặc một câu mời gọi mua hàng khéo léo.
      5. Nếu khách hỏi điều gì không liên quan đến hải sản hoặc VietChi, hãy lịch sự từ chối và lái câu chuyện quay lại đặc sản.
      
      Sử dụng định dạng Markdown (như bôi đậm **tên sản phẩm**) để câu trả lời dễ đọc.
    `;

    // 1. Thử gọi với Flash trước
    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hàng hỏi: ${userMessage}` }] }]
      })
    });

    let data = await response.json();

    // 2. Nếu lỗi 404 (Không tìm thấy model), hãy tự động dò tìm model khả dụng
    if (!response.ok && data.error?.code === 404) {
      console.warn("Model mặc định không tìm thấy, đang tự động dò tìm model khả dụng cho Key của bạn...");
      
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();
      
      if (listData.models && listData.models.length > 0) {
        // Tìm bất kỳ model nào hỗ trợ generateContent
        const availableModel = listData.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
        
        if (availableModel) {
          console.log("Tìm thấy model thay thế:", availableModel.name);
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/${availableModel.name}:generateContent?key=${apiKey}`;
          response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hàng hỏi: ${userMessage}` }] }]
            })
          });
          data = await response.json();
        }
      }
    }

    if (!response.ok) {
      console.error("Gemini API Error Detail:", data);
      throw new Error(data.error?.message || "Lỗi API");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Mình đang hơi bối rối, bạn hỏi lại được không?";
    return NextResponse.json({ role: "model", content: aiText });

  } catch (error) {
    console.error("Chatbot Final Error:", error.message);
    return NextResponse.json({ 
      error: "AI đang bảo trì hệ thống một chút, bạn thử lại sau nhe!" 
    }, { status: 500 });
  }
}
