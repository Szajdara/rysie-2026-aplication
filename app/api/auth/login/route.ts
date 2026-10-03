import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_AUTH_CREDENTIALS } from '@/lib/constants';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  timingSafeEqualString,
  createSignedSession,
} from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & Brute-force rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Zbyt wiele nieudanych prób logowania. Ze względów bezpieczeństwa zablokowano na ${rateCheck.waitSeconds}s.`,
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.waitSeconds) } }
      );
    }

    const body = await req.json();
    const { login, password } = body;

    if (!login || !password) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, message: 'Podaj login oraz hasło' },
        { status: 400 }
      );
    }

    // 2. Server-side expected credentials (never leaked to client bundle)
    const expectedLogin = process.env.ADMIN_LOGIN || DEFAULT_AUTH_CREDENTIALS.login;
    const expectedPassword =
      process.env.ADMIN_PASSWORD ||
      process.env.organizator_rysi_2026 ||
      'Rysie26org@niz@tor';

    // 3. Timing-attack safe comparison
    const isLoginValid = timingSafeEqualString(login.trim().toLowerCase(), expectedLogin.trim().toLowerCase());
    const isPasswordValid = timingSafeEqualString(password.trim(), expectedPassword.trim());

    if (isLoginValid && isPasswordValid) {
      // Clear rate limit counter on success
      clearRateLimit(clientIp);

      // Generate cryptographically signed HMAC token
      const signedToken = createSignedSession(expectedLogin);

      const response = NextResponse.json({
        success: true,
        message: 'Zalogowano pomyślnie',
        user: expectedLogin,
      });

      // Set hardened session cookie
      response.cookies.set('rysie_auth_session', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    }

    // Record failed attempt for brute-force tracking
    const failedResult = recordFailedAttempt(clientIp);
    if (failedResult.locked) {
      return NextResponse.json(
        {
          success: false,
          message: 'Przekroczono limit prób logowania. Dostęp zablokowany na 10 minut.',
        },
        { status: 429 }
      );
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
