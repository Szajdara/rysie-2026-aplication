import crypto from 'crypto';

// Secret key for HMAC signing
const SERVER_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  'rysie_2026_secret_gala_vault_key_982347198273';

// Brute-force protection: in-memory IP rate limiter
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale rate-limit entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (entry.lockedUntil < now && entry.attempts === 0) {
        rateLimitMap.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    const waitSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): { locked: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 };

  entry.attempts += 1;

  // If 5 failed attempts reached, lock for 10 minutes
  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 10 * 60 * 1000;
    entry.attempts = 0; // reset for next cycle
    rateLimitMap.set(ip, entry);
    return { locked: true, waitSeconds: 600 };
  }

  rateLimitMap.set(ip, entry);
  return { locked: false };
}

export function clearRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

// Timing-safe comparison to prevent side-channel timing attacks
export function timingSafeEqualString(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  if (bufferA.length !== bufferB.length) {
    // Perform dummy comparison to prevent length timing leaks
    crypto.timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

// Generate cryptographically signed HMAC session token
export function createSignedSession(username: string): string {
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}`;
  const hmac = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(payload)
    .digest('hex');

  // Return base64 encoded token: payload.signature
  const token = Buffer.from(`${payload}:${hmac}`).toString('base64url');
  return token;
}

// Verify HMAC session token and check expiration (30 days)
export function verifySignedSession(token?: string): { valid: boolean; user?: string } {
  if (!token) return { valid: false };

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');

    if (parts.length !== 3) return { valid: false };

    const [user, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return { valid: false };

    // Check expiration: 30 days
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return { valid: false };
    }

    // Verify signature with timing-safe comparison
    const expectedPayload = `${user}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(expectedPayload)
      .digest('hex');

    if (!timingSafeEqualString(signature, expectedSignature)) {
      return { valid: false };
    }

    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}
