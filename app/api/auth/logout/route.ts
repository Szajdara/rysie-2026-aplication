import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Wylogowano',
  });

  response.cookies.delete('rysie_auth_session');
  return response;
}
