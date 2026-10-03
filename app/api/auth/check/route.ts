import { NextRequest, NextResponse } from 'next/server';
import { verifySignedSession } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('rysie_auth_session');
  const token = cookie?.value;

  const verification = verifySignedSession(token);

  if (verification.valid && verification.user) {
    return NextResponse.json({
      authenticated: true,
      user: verification.user,
    });
  }

  return NextResponse.json({
    authenticated: false,
  });
}
