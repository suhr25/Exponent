// ─── Yahoo Finance Chart Proxy ──────────────────────────────────────────────
// Fetches real historical candlestick data for any NSE/BSE stock.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '1y';     // 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
  const interval = searchParams.get('interval') || '1d'; // 1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo

  if (!symbol) {
    return NextResponse.json({ error: 'symbol parameter required' }, { status: 400 });
  }

  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Yahoo Finance chart API error', status: res.status }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ error: 'No chart data found', candles: [] }, { status: 404 });
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const candles = timestamps.map((ts: number, i: number) => ({
      timestamp: ts,
      open: opens[i] != null ? +opens[i].toFixed(2) : null,
      high: highs[i] != null ? +highs[i].toFixed(2) : null,
      low: lows[i] != null ? +lows[i].toFixed(2) : null,
      close: closes[i] != null ? +closes[i].toFixed(2) : null,
      volume: volumes[i] || 0,
    })).filter((c: { open: number | null }) => c.open !== null);

    // Also extract meta for current price info
    const meta = result.meta || {};

    return NextResponse.json({
      symbol: symbol,
      candles,
      meta: {
        regularMarketPrice: meta.regularMarketPrice,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        currency: meta.currency,
        exchangeName: meta.exchangeName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chart data', details: String(error) },
      { status: 500 }
    );
  }
}
