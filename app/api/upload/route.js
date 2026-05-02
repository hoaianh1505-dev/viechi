import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'Không có file ảnh' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đường dẫn lưu ảnh: public/images
    const uploadDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/images/${filename}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
