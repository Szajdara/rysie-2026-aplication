import { NextRequest, NextResponse } from 'next/server';
import { VotesData } from '@/lib/types';
import { verifySignedSession } from '@/lib/auth-server';

let cachedVotes: VotesData | null = null;
let lastUpdated: number = 0;

function cleanEnv(val?: string): string | undefined {
  if (!val) return undefined;
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned || undefined;
}

function getRedisConfig() {
  const knownDatabaseUrl = 'https://wise-gobbler-191837.upstash.io';

  let rawUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_URL ||
    process.env.REDIS_URL;

  // Search through all env variables if not found
  if (!rawUrl) {
    for (const [, val] of Object.entries(process.env)) {
      if (typeof val === 'string' && val.includes('upstash.io')) {
        rawUrl = val;
        break;
      }
    }
  }

  // Search for token across all possible environment keys
  let rawToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_TOKEN ||
    process.env.UPSTASH_REDIS_TOKEN ||
    process.env.REDIS_TOKEN;

  if (!rawToken) {
    for (const [key, val] of Object.entries(process.env)) {
      const lower = key.toLowerCase();
      if (
        (lower.includes('upstash') || lower.includes('redis') || lower.includes('token')) &&
        !lower.includes('secret') &&
        !lower.includes('session') &&
        !lower.includes('next') &&
        !lower.includes('vercel') &&
        typeof val === 'string' &&
        val.length > 20
      ) {
        rawToken = val;
        break;
      }
    }
  }

  const redisToken = cleanEnv(rawToken);

  // Only consider redisUrl valid if we actually have a configured database URL or a valid token
  let redisUrl = cleanEnv(rawUrl);
  if (!redisUrl && redisToken) {
    redisUrl = knownDatabaseUrl;
  }

  if (redisUrl && !redisUrl.startsWith('http://') && !redisUrl.startsWith('https://')) {
    redisUrl = `https://${redisUrl}`;
  }

  return { redisUrl, redisToken };
}

function safeParseEnvelope(raw: any): { votes: any; lastUpdated: number } | null {
  if (raw === null || raw === undefined) return null;
  let parsed = raw;
  for (let i = 0; i < 4 && typeof parsed === 'string'; i++) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const votes = parsed.votes !== undefined ? parsed.votes : parsed;
  const lastUpdated = typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : 0;
  return { votes, lastUpdated };
}

export async function GET(req: NextRequest) {
  // Cybersecurity verification: only authenticated organizers can read votes
  const token = req.cookies.get('rysie_auth_session')?.value || req.headers.get('x-rysie-session') || undefined;
  const auth = verifySignedSession(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  const { redisUrl, redisToken } = getRedisConfig();

  if (redisUrl && redisToken) {
    try {
      if (req.nextUrl.searchParams.get('inspect') === 'all') {
        const keysRes = await fetch(`${redisUrl}/keys/*`, {
          headers: { Authorization: `Bearer ${redisToken}` },
          cache: 'no-store',
        });
        const keysData = await keysRes.json();
        const allData: Record<string, any> = {};
        if (Array.isArray(keysData?.result)) {
          for (const k of keysData.result) {
            const vRes = await fetch(`${redisUrl}/get/${k}`, {
              headers: { Authorization: `Bearer ${redisToken}` },
              cache: 'no-store',
            });
            allData[k] = await vRes.json();
          }
        }
        return NextResponse.json({ inspect: true, keys: keysData, allData });
      }

      const res = await fetch(`${redisUrl}/get/rysie_2026_votes`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        return NextResponse.json(
          {
            cloudSync: false,
            configured: true,
            error: `Błąd odpowiedzi bazy Redis (${res.status})`,
          },
          { status: 502 }
        );
      }

      const data = await res.json();
      if (data && data.result !== undefined && data.result !== null) {
        const envelope = safeParseEnvelope(data.result);
        if (envelope && envelope.votes && typeof envelope.votes === 'object') {
          return NextResponse.json({
            cloudSync: true,
            configured: true,
            votes: envelope.votes,
            lastUpdated: envelope.lastUpdated || lastUpdated,
          });
        }
      }

      // Connected to Redis, but key is empty yet (brand new database)
      return NextResponse.json({
        cloudSync: true,
        configured: true,
        isEmpty: true,
        votes: null,
        lastUpdated: 0,
      });
    } catch (e: any) {
      console.error('Error reading from Upstash Redis / Vercel KV:', e);
      return NextResponse.json(
        {
          cloudSync: false,
          configured: true,
          error: 'Błąd połączenia z bazą chmurową Redis',
        },
        { status: 503 }
      );
    }
  }

  // No Redis configured: inform client clearly so it stays in safe local mode
  return NextResponse.json({
    cloudSync: false,
    configured: false,
    message: 'Brak skonfigurowanej bazy Redis. Aplikacja działa bezpiecznie w trybie lokalnym.',
    votes: cachedVotes || null,
    lastUpdated: cachedVotes ? lastUpdated : 0,
  });
}

export async function POST(req: NextRequest) {
  // Cybersecurity verification: only authenticated organizers can write/modify votes
  const token = req.cookies.get('rysie_auth_session')?.value || req.headers.get('x-rysie-session') || undefined;
  const auth = verifySignedSession(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { votes } = body;

    if (!votes || typeof votes !== 'object') {
      return NextResponse.json({ error: 'Brak danych głosów' }, { status: 400 });
    }

    const now = Date.now();
    cachedVotes = votes;
    lastUpdated = now;

    const { redisUrl, redisToken } = getRedisConfig();

    if (redisUrl && redisToken) {
      try {
        const envelope = {
          votes,
          lastUpdated: now,
        };
        const res = await fetch(`${redisUrl}/set/rysie_2026_votes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(envelope),
        });

        if (!res.ok) {
          console.error('Upstash Redis set failed:', res.status, res.statusText);
          return NextResponse.json(
            {
              success: false,
              cloudSync: false,
              error: `Błąd zapisu w bazie chmurowej (${res.status})`,
              lastUpdated: now,
            },
            { status: 502 }
          );
        }

        return NextResponse.json({ success: true, cloudSync: true, lastUpdated: now });
      } catch (err: any) {
        console.error('Error saving to Upstash Redis / Vercel KV:', err);
        return NextResponse.json(
          {
            success: false,
            cloudSync: false,
            error: 'Błąd połączenia z bazą chmurową',
            lastUpdated: now,
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      cloudSync: false,
      configured: false,
      message: 'Zapisano tylko lokalnie (brak aktywnej bazy Redis)',
      lastUpdated: now,
    });
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane żądania' }, { status: 500 });
  }
}
