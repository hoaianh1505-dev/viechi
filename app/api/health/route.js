import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    message: 'VietChi Next.js API đang chạy!',
    timestamp: new Date().toISOString()
  });
}
