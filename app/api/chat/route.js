import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Settings from "@/models/Settings";

const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite", 
];

async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        role: "model", 
        content: "Chào bạn! Hiện tại mình chưa được kết nối AI (thiếu API Key). Bạn vui lòng liên hệ quản trị viên nhé! 🙏" 
      });
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
      1. Khách hỏi về sản phẩm: Hãy tư vấn nhiệt tình, nêu bật ưu điểm (phơi nắng tự nhiên, không chất bảo quản, hàng loại 1).
      2. Khách hỏi về đơn hàng: Hãy bảo khách cung cấp "Mã đơn hàng" (thường bắt đầu bằng # và có trong phần Lịch sử đơn hàng hoặc email). Sau đó hướng dẫn khách chờ bộ phận CSKH kiểm tra trong vài phút.
      3. Khách hỏi về vận chuyển: ${shopName} giao hàng toàn quốc. Phí ship sẽ được hệ thống tính toán chính xác khi khách nhập địa chỉ ở trang Thanh toán.
      4. Luôn kết thúc bằng một lời chúc hoặc một câu mời gọi mua hàng khéo léo.
      5. Nếu khách hỏi điều gì không liên quan đến sản phẩm hoặc ${shopName}, hãy lịch sự từ chối và lái câu chuyện quay lại đặc sản.
      
      Sử dụng định dạng Markdown (như bôi đậm **tên sản phẩm**) để câu trả lời dễ đọc.

      Khách hàng hỏi: ${userMessage}
    `;

    // Try multiple models with retry
    let lastError = null;
    for (const model of MODELS_TO_TRY) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const result = await callGemini(apiKey, model, systemPrompt);
          
          if (result.ok) {
            const aiText = result.data.candidates?.[0]?.content?.parts?.[0]?.text 
              || "Mình đang hơi bối rối, bạn hỏi lại được không? 😅";
            return NextResponse.json({ role: "model", content: aiText });
          }

          // If 404, skip to next model immediately
          if (result.status === 404) {
            console.log(`Model ${model} not found, trying next...`);
            break;
          }

          // If 503/429, wait and retry
          if (result.status === 503 || result.status === 429) {
            console.log(`Model ${model} busy (${result.status}), retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }

          lastError = result.data.error?.message || `Error ${result.status}`;
          break;
        } catch (err) {
          lastError = err.message;
        }
      }
    }

    // All models failed - return friendly message instead of 500
    console.warn("All Gemini models unavailable:", lastError);
    return NextResponse.json({ 
      role: "model", 
      content: `Xin lỗi bạn, hệ thống AI đang bận chút xíu! 🙏\n\nBạn có thể:\n- **Gọi hotline**: ${settings?.contactPhone || '0909 123 456'} để được tư vấn trực tiếp\n- **Nhắn lại sau** vài phút nha!\n\nCảm ơn bạn đã kiên nhẫn! ❤️`
    });

  } catch (error) {
    console.error("Chatbot Error:", error.message);
    return NextResponse.json({ 
      role: "model", 
      content: "Mình gặp trục trặc nhỏ rồi, bạn thử nhắn lại sau vài giây nhe! 🙏" 
    });
  }
}
