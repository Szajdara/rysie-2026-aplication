import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_AUTH_CREDENTIALS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = body;

    const expectedLogin = process.env.ADMIN_LOGIN || DEFAULT_AUTH_CREDENTIALS.login;
    const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_AUTH_CREDENTIALS.password;

    if (
      login &&
      password &&
      login.trim().toLowerCase() === expectedLogin.trim().toLowerCase() &&
      password.trim() === expectedPassword.trim()
    ) {
      const response = NextResponse.json({
        success: true,
        message: 'Zalogowano pomyślnie',
        user: expectedLogin,
      });

      // Set cookie for session persistence (30 days)
      response.cookies.set('rysie_auth_session', 'authenticated_organizer_rysie_2026', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Nieprawidłowy login lub hasło' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Błąd przetwarzania żądania' },
      { status: 500 }
    );
  }
}
