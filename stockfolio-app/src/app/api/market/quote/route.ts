import { NextRequest, NextResponse } from 'next/server';

const GROWW_API_BASE = process.env.GROWW_API_BASE_URL || 'https://api.groww.in/v1';
const GROWW_API_KEY = process.env.GROWW_API_KEY || '';

// Simple in-memory cache (per serverless instance)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds for live quotes

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get('symbols') || '';

  if (!symbols) {
    return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
  }

  const cacheKey = `quote:${symbols}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Try Groww API
    const response = await fetch(`${GROWW_API_BASE}/quote?symbols=${symbols}`, {
      headers: {
        'Authorization': `Bearer ${GROWW_API_KEY}`,
        'Accept': 'application/json',
        'X-API-VERSION': '1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      setCache(cacheKey, data);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log('Groww API unavailable, using mock data');
  }

  // Fallback response indicating mock data should be used
  return NextResponse.json({
    quotes: null,
    mock: true,
    message: 'Using local mock data',
  });
}
