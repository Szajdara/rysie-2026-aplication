import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('rysie_auth_session');
  const isAuthenticated = cookie?.value === 'authenticated_organizer_rysie_2026';

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
