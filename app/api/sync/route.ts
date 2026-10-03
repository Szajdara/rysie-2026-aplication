import { NextRequest, NextResponse } from 'next/server';
import { VotesData } from '@/lib/types';
import { INITIAL_VOTES_DATA } from '@/lib/constants';
import { verifySignedSession } from '@/lib/auth-server';

let cachedVotes: VotesData | null = null;
let lastUpdated: number = Date.now();

export async function GET(req: NextRequest) {
  // Cybersecurity verification: only authenticated organizers can read votes
  const token = req.cookies.get('rysie_auth_session')?.value;
  const auth = verifySignedSession(token);

  if (!auth.valid) {
    return NextResponse.json({ error: 'Nieautoryzowany dostęp' }, { status: 401 });
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const res = await fetch(`${redisUrl}/get/rysie_2026_votes`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return NextResponse.json({
          cloudSync: true,
          votes: parsed,
          lastUpdated,
        });
      }
    } catch (e) {
      console.error('Error reading from Upstash Redis:', e);
    }
  }

  return NextResponse.json({
    cloudSync: Boolean(redisUrl && redisToken),
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

    cachedVotes = votes;
    lastUpdated = Date.now();

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      try {
        await fetch(`${redisUrl}/set/rysie_2026_votes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${redisToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(votes)),
        });
        return NextResponse.json({ success: true, cloudSync: true, lastUpdated });
      } catch (err) {
        console.error('Error saving to Upstash Redis:', err);
      }
    }

    return NextResponse.json({ success: true, cloudSync: false, lastUpdated });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 500 });
  }
}
