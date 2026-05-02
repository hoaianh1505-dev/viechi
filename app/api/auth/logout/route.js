import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('vietchi_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  const response = NextResponse.json({ message: 'Đăng xuất thành công' });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
