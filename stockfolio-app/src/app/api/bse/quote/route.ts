// ─── BSE Quote Proxy ─────────────────────────────────────────────────────────
// Proxies price requests to BSE India API with required headers.

import { NextRequest, NextResponse } from 'next/server';

const BSE_BASE = 'https://api.bseindia.com/BseIndiaAPI/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'symbols parameter required' }, { status: 400 });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);

  try {
    // Attempt to fetch from BSE for each symbol
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

    // BSE API: fetch equity quote by scrip code or symbol
    // For now, we batch with Promise.allSettled to handle individual failures
    const promises = symbolList.map(async (symbol) => {
      try {
        const res = await fetch(
          `${BSE_BASE}/getScripHeaderData/Equity/${symbol}`,
          {
            headers: {
              'Referer': 'https://www.bseindia.com',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
            next: { revalidate: 5 }, // cache for 5 seconds
          }
        );

        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.Header) return null;

        const h = data.Header;
        const ltp = parseFloat(h.CurrValue || h.LTP || '0');
        const prevClose = parseFloat(h.PrevClose || '0');
        const change = parseFloat(h.Change || '0');
        const changePct = parseFloat(h.PerChange || '0');

        prices[symbol] = {
          ltp,
          open: parseFloat(h.Open || '0'),
          high: parseFloat(h.High || '0'),
          low: parseFloat(h.Low || '0'),
          close: prevClose,
          volume: parseInt(h.TotalVol || '0', 10),
          change,
          changePercent: changePct,
          updatedAt: Date.now(),
        };
      } catch {
        // Individual symbol fetch failed, skip
      }
    });

    await Promise.allSettled(promises);

    return NextResponse.json({ prices, count: Object.keys(prices).length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch BSE data', details: String(error) },
      { status: 500 }
    );
  }
}
