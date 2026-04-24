import { NextRequest, NextResponse } from 'next/server';
import { NIFTY_50_STOCKS } from '@/lib/utils/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').toLowerCase();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // Local stock search (fast, always available)
  const results = NIFTY_50_STOCKS
    .filter(s =>
      s.symbol.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.sector.toLowerCase().includes(query)
    )
    .slice(0, 10)
    .map(s => ({
      symbol: s.symbol,
      companyName: s.name,
      exchange: 'NSE',
      sector: s.sector,
    }));

  return NextResponse.json({ results });
}
