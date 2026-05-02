import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const fd = await req.formData();
    const files = fd.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file nào được gửi' }, { status: 400 });
    }

    const uploadPromises = files.map((file) => {
      return new Promise(async (resolve, reject) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        cloudinary.uploader.upload_stream(
          { folder: 'vietchi_banners' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Lỗi upload multiple Cloudinary:', error);
    return NextResponse.json({ error: 'Lỗi upload lên Cloudinary' }, { status: 500 });
  }
}
