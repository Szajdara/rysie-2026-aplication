import { NextRequest, NextResponse } from 'next/server';
import { VotesData } from '@/lib/types';
import { INITIAL_VOTES_DATA } from '@/lib/constants';
import { verifySignedSession } from '@/lib/auth-server';

let cachedVotes: VotesData | null = null;
let lastUpdated: number = Date.now();

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

  let redisUrl = cleanEnv(rawUrl) || knownDatabaseUrl;
  if (!redisUrl.startsWith('http://') && !redisUrl.startsWith('https://')) {
    redisUrl = `https://${redisUrl}`;
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

  return { redisUrl, redisToken };
}

export async function GET(req: NextRequest) {
  // Cybersecurity verification: only authenticated organizers can read votes
  const token = req.cookies.get('rysie_auth_session')?.value;
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
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        // Support envelope structure { votes, lastUpdated } or legacy plain votes
        const votes = parsed.votes || parsed;
        const timestamp = typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : lastUpdated;
        return NextResponse.json({
          cloudSync: true,
          hasToken: true,
          votes,
          lastUpdated: timestamp,
        });
      } else {
        // Connected to Redis, but key is empty yet (brand new database)
        return NextResponse.json({
          cloudSync: true,
          hasToken: true,
          votes: cachedVotes || INITIAL_VOTES_DATA,
          lastUpdated,
        });
      }
    } catch (e) {
      console.error('Error reading from Upstash Redis / Vercel KV:', e);
    }
  }

  return NextResponse.json({
    cloudSync: Boolean(redisUrl && redisToken),
    hasToken: Boolean(redisToken),
    votes: cachedVotes || INITIAL_VOTES_DATA,
    lastUpdated,
  });
}

export async function POST(req: NextRequest) {
  // Cybersecurity verification: only authenticated organizers can write/modify votes
  const token = req.cookies.get('rysie_auth_session')?.value;
  const auth = verifySignedSession(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { votes } = body;

    if (!votes) {
      return NextResponse.json({ error: 'Missing votes' }, { status: 400 });
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
        await fetch(`${redisUrl}/set/rysie_2026_votes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(envelope)),
        });
        return NextResponse.json({ success: true, cloudSync: true, lastUpdated: now });
      } catch (err) {
        console.error('Error saving to Upstash Redis / Vercel KV:', err);
      }
    }

    return NextResponse.json({ success: true, cloudSync: false, lastUpdated: now });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 500 });
  }
}
