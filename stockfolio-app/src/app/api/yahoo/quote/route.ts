// ─── Yahoo Finance Quote Proxy ───────────────────────────────────────────────
// Fallback price source via Yahoo Finance API.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
  }

  // Convert symbols to Yahoo format: RELIANCE → RELIANCE.NS
  const yahooSymbols = symbols
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.includes('.') ? s : `${s}.NS`);

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols.join(',')}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 10 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Yahoo Finance API error', status: res.status }, { status: 502 });
    }

    const data = await res.json();
    const quotes = data?.quoteResponse?.result || [];

    const prices: Record<string, {
      ltp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      change: number;
      changePercent: number;
      updatedAt: number;
    }> = {};

    quotes.forEach((q: Record<string, number | string>) => {
      // Strip .NS/.BO suffix
      const symbol = String(q.symbol || '').replace(/\.(NS|BO)$/, '');
      prices[symbol] = {
        ltp: Number(q.regularMarketPrice || 0),
        open: Number(q.regularMarketOpen || 0),
        high: Number(q.regularMarketDayHigh || 0),
        low: Number(q.regularMarketDayLow || 0),
        close: Number(q.regularMarketPreviousClose || 0),
        volume: Number(q.regularMarketVolume || 0),
        change: Number(q.regularMarketChange || 0),
        changePercent: Number(q.regularMarketChangePercent || 0),
        updatedAt: Date.now(),
      };
    });

    return NextResponse.json({ prices, count: Object.keys(prices).length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Yahoo Finance data', details: String(error) },
      { status: 500 }
    );
  }
}
