import { NextRequest, NextResponse } from 'next/server';

const GROWW_BASE = 'https://api.groww.in';
const GROWW_TOKEN = process.env.GROWW_API_KEY || '';

// In-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5000; // 5s for live quotes

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

const GROWW_HEADERS = {
  'Authorization': `Bearer ${GROWW_TOKEN}`,
  'Accept': 'application/json',
  'X-API-VERSION': '1.0',
};

/**
 * GET /api/market/quote?symbols=RELIANCE,TCS,INFY
 *
 * Fetches live quotes from the Groww Trading API.
 * Each symbol is queried individually against NSE CASH segment.
 * Falls back to mock: true if the API is unavailable or no key is set.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get('symbols') || '';

  if (!symbols) {
    return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
  const cacheKey = `quote:${symbolList.sort().join(',')}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Skip API call if no token
  if (!GROWW_TOKEN) {
    return NextResponse.json({ quotes: null, mock: true, message: 'GROWW_API_KEY not set — using mock data' });
  }

  try {
    // Batch up to 50 symbols per call (Groww LTP endpoint supports multi-instrument)
    // For full quotes, we call individually per symbol
    const results: Record<string, unknown> = {};

    // Use Promise.allSettled to handle partial failures
    const promises = symbolList.map(async (sym) => {
      const url = `${GROWW_BASE}/v1/live-data/quote?exchange=NSE&segment=CASH&trading_symbol=${sym}`;
      const res = await fetch(url, {
        headers: GROWW_HEADERS,
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        results[sym] = data;
      }
    });

    await Promise.allSettled(promises);

    if (Object.keys(results).length > 0) {
      const responseData = { quotes: results, mock: false };
      setCache(cacheKey, responseData);
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error('Groww quote API error:', error);
  }

  return NextResponse.json({ quotes: null, mock: true, message: 'Groww API unavailable — using mock data' });
}
