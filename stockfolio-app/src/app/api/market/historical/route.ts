import { NextRequest, NextResponse } from 'next/server';

const GROWW_API_BASE = process.env.GROWW_API_BASE_URL || 'https://api.groww.in/v1';
const GROWW_API_KEY = process.env.GROWW_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute for historical data

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || '';
  const interval = searchParams.get('interval') || '1D';
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';

  if (!symbol) {
    return NextResponse.json({ error: 'symbol parameter required' }, { status: 400 });
  }

  const cacheKey = `historical:${symbol}:${interval}:${start}:${end}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch(
      `${GROWW_API_BASE}/historical/candle/range?symbol=${symbol}&interval=${interval}&start=${start}&end=${end}`,
      {
        headers: {
          'Authorization': `Bearer ${GROWW_API_KEY}`,
          'Accept': 'application/json',
          'X-API-VERSION': '1.0',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.log('Groww historical API unavailable');
  }

  return NextResponse.json({ candles: null, mock: true });
}
