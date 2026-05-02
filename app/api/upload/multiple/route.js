import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const fd = await req.formData();
    const files = fd.getAll('images'); // Lấy tất cả file có key là 'images'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file nào được gửi' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public', 'images');
    
    // Đảm bảo thư mục tồn tại
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const urls = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e5)}-${file.name}`;
      const path = join(uploadDir, fileName);

      await writeFile(path, buffer);
      urls.push(`/images/${fileName}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Lỗi upload multiple:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
