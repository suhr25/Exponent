// ─── Yahoo Finance Quote Proxy ───────────────────────────────────────────────
// Uses the v8 chart API (which doesn't require auth) to get current price data.

import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (10 sec TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 10_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);

  // Check if all symbols are cached
  const cacheKey = symbolList.sort().join(',');
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const prices: Record<string, {
    ltp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    marketCap: number;
    pe: number;
    high52w: number;
    low52w: number;
    updatedAt: number;
  }> = {};

  // Fetch each symbol using v8 chart API (no auth required)
  const promises = symbolList.map(async (symbol) => {
    try {
      const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d&includePrePost=false`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      if (!res.ok) {
        // Try BSE if NSE fails
        const bseRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BO?interval=1d&range=5d&includePrePost=false`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
        );
        if (!bseRes.ok) return;
        const bseData = await bseRes.json();
        extractPrice(bseData, symbol, prices);
        return;
      }

      const data = await res.json();
      extractPrice(data, symbol, prices);
    } catch {
      // Skip failed symbols
    }
  });

  await Promise.allSettled(promises);

  const result = { prices, count: Object.keys(prices).length };
  cache.set(cacheKey, { data: result, ts: Date.now() });

  return NextResponse.json(result);
}

function extractPrice(data: Record<string, unknown>, symbol: string, prices: Record<string, Record<string, number>>) {
  try {
    const chartData = data as { chart?: { result?: Array<Record<string, unknown>> } };
    const result = chartData?.chart?.result?.[0];
    if (!result) return;

    const meta = result.meta as Record<string, number | string> | undefined;
    if (!meta) return;

    const ltp = Number(meta.regularMarketPrice || 0);
    const prevClose = Number(meta.previousClose || meta.chartPreviousClose || 0);
    const change = ltp - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    // Get today's OHLV from the last candle
    const timestamps = (result.timestamp as number[]) || [];
    const quote = ((result.indicators as Record<string, unknown>)?.quote as Array<Record<string, number[]>>)?.[0] || {};
    const lastIdx = timestamps.length - 1;

    prices[symbol] = {
      ltp: +ltp.toFixed(2),
      open: quote.open?.[lastIdx] ? +quote.open[lastIdx].toFixed(2) : ltp,
      high: quote.high?.[lastIdx] ? +quote.high[lastIdx].toFixed(2) : ltp,
      low: quote.low?.[lastIdx] ? +quote.low[lastIdx].toFixed(2) : ltp,
      close: +prevClose.toFixed(2),
      volume: quote.volume?.[lastIdx] || 0,
      change: +change.toFixed(2),
      changePercent: +changePercent.toFixed(2),
      marketCap: 0, // Not available from chart API
      pe: 0,
      high52w: Number(meta.fiftyTwoWeekHigh || 0),
      low52w: Number(meta.fiftyTwoWeekLow || 0),
      updatedAt: Date.now(),
    };
  } catch {
    // Skip parse errors
  }
}
