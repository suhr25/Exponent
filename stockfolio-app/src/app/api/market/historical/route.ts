import { NextRequest, NextResponse } from 'next/server';

const GROWW_BASE = 'https://api.groww.in';
const GROWW_TOKEN = process.env.GROWW_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute for historical data

const GROWW_HEADERS = {
  'Authorization': `Bearer ${GROWW_TOKEN}`,
  'Accept': 'application/json',
  'X-API-VERSION': '1.0',
};

/**
 * GET /api/market/historical?symbol=RELIANCE&interval=1D&start=2025-01-01&end=2026-05-01
 *
 * Fetches historical candle data from the Groww Trading API.
 * Endpoint: GET /v1/historical/candle/range
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || '';
  const interval = searchParams.get('interval') || '1D'; // 1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M
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

  if (!GROWW_TOKEN) {
    return NextResponse.json({ candles: null, mock: true, message: 'GROWW_API_KEY not set' });
  }

  try {
    const params = new URLSearchParams({
      exchange: 'NSE',
      segment: 'CASH',
      trading_symbol: symbol,
      interval,
      ...(start && { start }),
      ...(end && { end }),
    });

    const url = `${GROWW_BASE}/v1/historical/candle/range?${params.toString()}`;
    const response = await fetch(url, {
      headers: GROWW_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error(`Groww historical API ${response.status}:`, errorText);
    }
  } catch (error) {
    console.error('Groww historical API error:', error);
  }

  return NextResponse.json({ candles: null, mock: true });
}
