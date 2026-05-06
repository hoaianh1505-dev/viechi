import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    await dbConnect();
    const products = await Product.find({}).lean();
    
    const productContext = products.map(p => 
      `- ${p.name}: ${p.price.toLocaleString()}đ/${p.unit || 'kg'}. Mo ta: ${p.description}`
    ).join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Ban la VietChi AI - chuyen vien tu van tan tam cua cua hang dac san VietChi (chuyen hai san kho Kien Giang).
      Day la danh sach san pham hien tai cua cua hang:
      ${productContext}

      Nhiem vu cua ban:
      1. Tra loi cau hoi cua khach hang mot cach lich su, than thien, dam chat mien Tay.
      2. Tu van dung loai san pham dua tren nhu cau cua khach (vd: lam qua bieu, an lien, hay nau canh).
      3. Luon nhac khach rang san pham cua VietChi la hang loai 1, phoi tu nhien, khong chat bao quan.
      4. Neu khach hoi ve ship, hay bao la "VietChi giao hang toan quoc, phi ship se duoc tinh khi thanh toan".
      5. Tra loi ngan gon, xuc tich, de hieu.
      
      Hay su dung tieng Viet co dau.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Da hieu! Toi la VietChi AI, toi da san sang tu van cho khach hang ve cac dac san kho thuong hang cua cua hang." }] },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ role: "model", content: text });

  } catch (error) {
    console.error("Chatbot Error:", error);
    return NextResponse.json({ error: "AI dang ban mot chut, ban thu lai sau nhe!" }, { status: 500 });
  }
}
