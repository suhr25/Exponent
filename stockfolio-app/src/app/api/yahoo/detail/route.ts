// ─── Yahoo Finance Stock Detail Proxy ────────────────────────────────────────
// Fetches real stock details using the v8 chart API (no auth required).
// Tries v10 quoteSummary first, falls back to v8 chart for basic data.

import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (5 min TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'symbol parameter required' }, { status: 400 });
  }

  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;

  // Strategy: Use v8 chart API (always works) to get price data
  // Also try v10 quoteSummary for fundamentals (may fail due to auth)
  const [chartResult, summaryResult] = await Promise.allSettled([
    fetchChart(yahooSymbol, symbol),
    fetchSummary(yahooSymbol, symbol),
  ]);

  const chartData = chartResult.status === 'fulfilled' ? chartResult.value : null;
  const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;

  if (!chartData && !summaryData) {
    // Try BSE
    const [bseChart, bseSummary] = await Promise.allSettled([
      fetchChart(`${symbol}.BO`, symbol),
      fetchSummary(`${symbol}.BO`, symbol),
    ]);
    const bseChartData = bseChart.status === 'fulfilled' ? bseChart.value : null;
    const bseSummaryData = bseSummary.status === 'fulfilled' ? bseSummary.value : null;

    if (!bseChartData && !bseSummaryData) {
      return NextResponse.json({ error: 'Stock not found on Yahoo Finance', symbol }, { status: 404 });
    }

    const result = mergeData(symbol, bseChartData, bseSummaryData);
    cache.set(symbol, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  }

  const result = mergeData(symbol, chartData, summaryData);
  cache.set(symbol, { data: result, ts: Date.now() });
  return NextResponse.json(result);
}

async function fetchChart(yahooSymbol: string, _symbol: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d&includePrePost=false`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    return result;
  } catch { return null; }
}

async function fetchSummary(yahooSymbol: string, _symbol: string) {
  try {
    const modules = 'price,summaryDetail,defaultKeyStatistics,financialData,assetProfile,incomeStatementHistory,balanceSheetHistory,majorHoldersBreakdown';
    const res = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.quoteSummary?.result?.[0] || null;
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeData(symbol: string, chart: any, summary: any) {
  const result: Record<string, unknown> = { symbol };

  // ── From Chart API (always available) ──
  if (chart) {
    const meta = chart.meta || {};
    const ltp = Number(meta.regularMarketPrice || 0);
    const prevClose = Number(meta.previousClose || meta.chartPreviousClose || 0);

    result.ltp = +ltp.toFixed(2);
    result.close = +prevClose.toFixed(2);
    result.change = +(ltp - prevClose).toFixed(2);
    result.changePercent = prevClose > 0 ? +((ltp - prevClose) / prevClose * 100).toFixed(2) : 0;
    result.high52w = Number(meta.fiftyTwoWeekHigh || 0);
    result.low52w = Number(meta.fiftyTwoWeekLow || 0);
    result.companyName = meta.longName || meta.shortName || symbol;

    // Get latest candle OHLV
    const timestamps = chart.timestamp || [];
    const q = chart.indicators?.quote?.[0] || {};
    const last = timestamps.length - 1;
    if (last >= 0) {
      result.open = q.open?.[last] ? +q.open[last].toFixed(2) : ltp;
      result.high = q.high?.[last] ? +q.high[last].toFixed(2) : ltp;
      result.low = q.low?.[last] ? +q.low[last].toFixed(2) : ltp;
      result.volume = q.volume?.[last] || 0;
    }
  }

  // ── From Summary API (may not be available due to auth) ──
  if (summary) {
    const v = (obj: unknown): number | null => {
      if (obj && typeof obj === 'object' && 'raw' in obj) return (obj as { raw: number }).raw;
      if (typeof obj === 'number') return obj;
      return null;
    };
    const fmt = (obj: unknown): string | null => {
      if (obj && typeof obj === 'object' && 'fmt' in obj) return (obj as { fmt: string }).fmt;
      if (typeof obj === 'string') return obj;
      return null;
    };

    const price = summary.price || {};
    const sd = summary.summaryDetail || {};
    const ks = summary.defaultKeyStatistics || {};
    const fd = summary.financialData || {};
    const ap = summary.assetProfile || {};
    const holders = summary.majorHoldersBreakdown || {};

    // Override with more accurate data from price module
    if (v(price.regularMarketPrice)) result.ltp = v(price.regularMarketPrice);
    if (v(price.marketCap)) result.marketCap = v(price.marketCap);
    if (price.longName) result.companyName = price.longName;
    if (v(price.regularMarketChange)) result.change = v(price.regularMarketChange);
    if (v(price.regularMarketChangePercent)) result.changePercent = v(price.regularMarketChangePercent);

    // Company info
    if (ap.sector) result.sector = ap.sector;
    if (ap.industry) result.industry = ap.industry;
    if (ap.longBusinessSummary) result.description = ap.longBusinessSummary;
    if (ap.website) result.website = ap.website;
    if (v(ap.fullTimeEmployees)) result.employees = v(ap.fullTimeEmployees);

    // Key stats
    result.pe = v(sd.trailingPE) || v(ks.trailingPE);
    result.forwardPe = v(sd.forwardPE) || v(ks.forwardPE);
    result.pb = v(ks.priceToBook);
    result.eps = v(ks.trailingEps);
    result.bookValue = v(ks.bookValue);
    result.dividendYield = v(sd.dividendYield) ? (v(sd.dividendYield) as number) * 100 : null;
    result.beta = v(sd.beta);
    result.avgVolume = v(sd.averageVolume);

    // Financial ratios
    result.roe = v(fd.returnOnEquity) ? (v(fd.returnOnEquity) as number) * 100 : null;
    result.roa = v(fd.returnOnAssets) ? (v(fd.returnOnAssets) as number) * 100 : null;
    result.debtToEquity = v(fd.debtToEquity) ? (v(fd.debtToEquity) as number) / 100 : null;
    result.currentRatio = v(fd.currentRatio);
    result.profitMargin = v(fd.profitMargins) ? (v(fd.profitMargins) as number) * 100 : null;
    result.operatingMargin = v(fd.operatingMargins) ? (v(fd.operatingMargins) as number) * 100 : null;
    result.grossMargin = v(fd.grossMargins) ? (v(fd.grossMargins) as number) * 100 : null;
    result.revenueGrowth = v(fd.revenueGrowth) ? (v(fd.revenueGrowth) as number) * 100 : null;
    result.earningsGrowth = v(fd.earningsGrowth) ? (v(fd.earningsGrowth) as number) * 100 : null;
    result.totalRevenue = v(fd.totalRevenue);
    result.totalDebt = v(fd.totalDebt);
    result.totalCash = v(fd.totalCash);
    result.freeCashflow = v(fd.freeCashflow);
    result.operatingCashflow = v(fd.operatingCashflow);
    result.targetMeanPrice = v(fd.targetMeanPrice);
    result.recommendationKey = fd.recommendationKey || null;

    // Holders
    result.insidersPercentHeld = v(holders.insidersPercentHeld) ? (v(holders.insidersPercentHeld) as number) * 100 : null;
    result.institutionsPercentHeld = v(holders.institutionsPercentHeld) ? (v(holders.institutionsPercentHeld) as number) * 100 : null;

    // Financials
    const incomeHistory = summary.incomeStatementHistory?.incomeStatementHistory || [];
    result.financials = incomeHistory.slice(0, 5).map((stmt: Record<string, unknown>) => ({
      period: fmt(stmt.endDate) || 'N/A',
      revenue: v(stmt.totalRevenue),
      netProfit: v(stmt.netIncome),
      operatingIncome: v(stmt.operatingIncome),
    }));
  }

  // Set defaults for missing fields
  if (!result.sector) result.sector = 'N/A';
  if (!result.industry) result.industry = 'N/A';
  if (!result.description) result.description = '';
  if (!result.financials) result.financials = [];
  if (!result.companyName) result.companyName = symbol;

  return result;
}
