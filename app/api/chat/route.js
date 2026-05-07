import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";

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
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ role: "model", content: "Thiếu API Key!" });
    }

    await dbConnect();
    
    const [products, settings] = await Promise.all([
      Product.find({}).lean(),
      Settings.findOne({}).lean()
    ]);
    
    const productContext = products.map(p => 
      `- **${p.name}**: ${p.price?.toLocaleString()}đ/${p.unit || 'kg'}. ${p.description || ''}`
    ).join("\n");

    const shopName = settings?.siteName || 'VietChi';
    const brandStory = settings?.brandStory || '';
    const aiRole = settings?.aiRole || 'Chuyên gia tư vấn hải sản khô nhiệt tình.';

    const systemPrompt = `
      Bạn là **${shopName} AI Advisor** - ${aiRole}
      Phong cách: Thân thiện, nhiệt tình, thật thà, đậm chất người miền Tây Nam Bộ (Kiên Giang).
      ${brandStory ? `Câu chuyện thương hiệu: ${brandStory}` : ''}
      
      Danh sách sản phẩm chúng ta đang có:
      ${productContext}

      Quy tắc tư vấn:
      1. Khách hỏi về sản phẩm: Hãy tư vấn nhiệt tình, nêu bật ưu điểm.
      2. Khách hỏi về đơn hàng: Bảo khách cung cấp Mã đơn hàng để CSKH kiểm tra.
      3. Khách hỏi về vận chuyển: Giao hàng toàn quốc, phí ship tính ở trang Thanh toán.
      4. Luôn kết thúc bằng một lời chúc hoặc một câu mời gọi mua hàng khéo léo.
      5. Nếu khách hỏi điều gì không liên quan đến đặc sản hoặc ${shopName}, hãy lịch sự từ chối.
      
      Sử dụng định dạng Markdown để câu trả lời dễ đọc.

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
