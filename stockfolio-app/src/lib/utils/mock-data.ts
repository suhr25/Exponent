// ─── Mock Data for Development & API Fallback ────────────────────────────────

import type { StockQuote, MarketIndex, MarketMover, CandleData, StockDetail } from '@/lib/types/market';
import type { Holding, PortfolioSummary, SectorAllocation } from '@/lib/types/portfolio';
import { SECTOR_COLORS } from './constants';

// Seed-based pseudo-random for consistent data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randomPrice(base: number, variance: number = 0.05): number {
  return +(base * (1 + (rand() - 0.5) * 2 * variance)).toFixed(2);
}

function randomChange(): { change: number; changePercent: number } {
  const pct = (rand() - 0.45) * 10;
  return { change: +(pct * 25).toFixed(2), changePercent: +pct.toFixed(2) };
}

// ─── Market Indices ──────────────────────────────────────────────────────────

export const MOCK_INDICES: MarketIndex[] = [
  { name: 'NIFTY 50', value: 24356.75, change: 234.50, changePercent: 0.97, status: 'up' },
  { name: 'SENSEX', value: 80234.80, change: 756.30, changePercent: 0.95, status: 'up' },
  { name: 'NIFTY BANK', value: 52890.25, change: -123.45, changePercent: -0.23, status: 'down' },
  { name: 'NIFTY IT', value: 34567.90, change: 456.78, changePercent: 1.34, status: 'up' },
  { name: 'NIFTY MIDCAP', value: 48234.15, change: 89.60, changePercent: 0.19, status: 'up' },
];

// ─── Stock Quotes ────────────────────────────────────────────────────────────

export const MOCK_QUOTES: StockQuote[] = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', ltp: 2876.45, open: 2850.00, high: 2895.30, low: 2842.10, close: 2856.75, volume: 12456789, change: 19.70, changePercent: 0.69, marketCap: 19.5e12, pe: 28.4, pb: 2.8, sector: 'Oil & Gas', industry: 'Refineries', dividendYield: 0.35, high52w: 3024.90, low52w: 2220.30 },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', ltp: 3842.90, open: 3810.00, high: 3860.50, low: 3798.20, close: 3820.15, volume: 8765432, change: 22.75, changePercent: 0.60, marketCap: 14.0e12, pe: 32.1, pb: 14.2, sector: 'IT', industry: 'IT Services', dividendYield: 1.2, high52w: 4250.80, low52w: 3311.50 },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', ltp: 1678.30, open: 1665.00, high: 1690.80, low: 1658.40, close: 1670.50, volume: 15234567, change: 7.80, changePercent: 0.47, marketCap: 12.8e12, pe: 19.8, pb: 3.1, sector: 'Banking', industry: 'Private Banks', dividendYield: 1.1, high52w: 1880.00, low52w: 1430.20 },
  { symbol: 'INFY', companyName: 'Infosys Ltd', ltp: 1567.85, open: 1555.00, high: 1578.90, low: 1548.30, close: 1560.25, volume: 9876543, change: 7.60, changePercent: 0.49, marketCap: 6.5e12, pe: 25.6, pb: 8.4, sector: 'IT', industry: 'IT Services', dividendYield: 2.1, high52w: 1953.90, low52w: 1358.80 },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', ltp: 1234.50, open: 1225.00, high: 1245.80, low: 1218.60, close: 1228.75, volume: 11234567, change: 5.75, changePercent: 0.47, marketCap: 8.7e12, pe: 17.9, pb: 3.4, sector: 'Banking', industry: 'Private Banks', dividendYield: 0.8, high52w: 1362.30, low52w: 920.50 },
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever Ltd', ltp: 2456.70, open: 2440.00, high: 2468.50, low: 2432.10, close: 2445.30, volume: 3456789, change: 11.40, changePercent: 0.47, marketCap: 5.8e12, pe: 56.2, pb: 11.8, sector: 'FMCG', industry: 'FMCG', dividendYield: 1.6, high52w: 2859.40, low52w: 2172.00 },
  { symbol: 'ITC', companyName: 'ITC Ltd', ltp: 467.25, open: 462.00, high: 470.80, low: 460.50, close: 464.15, volume: 18765432, change: 3.10, changePercent: 0.67, marketCap: 5.8e12, pe: 27.8, pb: 7.6, sector: 'FMCG', industry: 'Cigarettes', dividendYield: 3.1, high52w: 499.70, low52w: 399.80 },
  { symbol: 'SBIN', companyName: 'State Bank of India', ltp: 789.40, open: 782.00, high: 795.60, low: 778.90, close: 784.75, volume: 21456789, change: 4.65, changePercent: 0.59, marketCap: 7.0e12, pe: 10.2, pb: 1.8, sector: 'Banking', industry: 'Public Banks', dividendYield: 1.6, high52w: 912.30, low52w: 600.20 },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', ltp: 1567.80, open: 1555.00, high: 1580.40, low: 1548.20, close: 1560.35, volume: 6543210, change: 7.45, changePercent: 0.48, marketCap: 9.4e12, pe: 75.3, pb: 8.9, sector: 'Telecom', industry: 'Telecom', dividendYield: 0.5, high52w: 1778.50, low52w: 1200.10 },
  { symbol: 'BAJFINANCE', companyName: 'Bajaj Finance Ltd', ltp: 6789.50, open: 6750.00, high: 6820.30, low: 6720.80, close: 6760.15, volume: 2345678, change: 29.35, changePercent: 0.43, marketCap: 4.2e12, pe: 30.5, pb: 6.2, sector: 'Finance', industry: 'NBFC', dividendYield: 0.4, high52w: 8192.00, low52w: 5875.60 },
  { symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', ltp: 12456.80, open: 12380.00, high: 12520.40, low: 12340.60, close: 12410.25, volume: 1234567, change: 46.55, changePercent: 0.37, marketCap: 3.8e12, pe: 26.8, pb: 5.4, sector: 'Auto', industry: 'Automobiles', dividendYield: 0.8, high52w: 13680.00, low52w: 9700.50 },
  { symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical', ltp: 1678.90, open: 1665.00, high: 1692.40, low: 1658.30, close: 1670.45, volume: 4567890, change: 8.45, changePercent: 0.51, marketCap: 4.0e12, pe: 35.2, pb: 6.8, sector: 'Pharma', industry: 'Pharma', dividendYield: 0.7, high52w: 1960.20, low52w: 1222.80 },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', ltp: 678.45, open: 672.00, high: 685.30, low: 668.80, close: 674.15, volume: 16789012, change: 4.30, changePercent: 0.64, marketCap: 2.5e12, pe: 8.4, pb: 3.2, sector: 'Auto', industry: 'Automobiles', dividendYield: 0.3, high52w: 1080.20, low52w: 610.50 },
  { symbol: 'TITAN', companyName: 'Titan Company Ltd', ltp: 3456.70, open: 3430.00, high: 3478.90, low: 3415.20, close: 3442.85, volume: 2456789, change: 13.85, changePercent: 0.40, marketCap: 3.1e12, pe: 85.6, pb: 18.4, sector: 'Consumer', industry: 'Jewellery', dividendYield: 0.3, high52w: 3887.00, low52w: 2995.50 },
  { symbol: 'TATASTEEL', companyName: 'Tata Steel Ltd', ltp: 145.60, open: 143.80, high: 147.20, low: 142.50, close: 144.35, volume: 32456789, change: 1.25, changePercent: 0.87, marketCap: 1.8e12, pe: 56.8, pb: 1.9, sector: 'Metals', industry: 'Steel', dividendYield: 2.4, high52w: 184.60, low52w: 118.30 },
  { symbol: 'WIPRO', companyName: 'Wipro Ltd', ltp: 467.30, open: 463.00, high: 470.80, low: 460.50, close: 464.85, volume: 7654321, change: 2.45, changePercent: 0.53, marketCap: 2.4e12, pe: 20.4, pb: 3.2, sector: 'IT', industry: 'IT Services', dividendYield: 0.2, high52w: 562.40, low52w: 396.80 },
  { symbol: 'LT', companyName: 'Larsen & Toubro Ltd', ltp: 3567.40, open: 3540.00, high: 3590.80, low: 3528.60, close: 3552.75, volume: 3456789, change: 14.65, changePercent: 0.41, marketCap: 4.9e12, pe: 34.2, pb: 5.6, sector: 'Infrastructure', industry: 'Engineering', dividendYield: 0.8, high52w: 3925.80, low52w: 2920.40 },
  { symbol: 'ADANIENT', companyName: 'Adani Enterprises Ltd', ltp: 2345.60, open: 2320.00, high: 2368.40, low: 2305.80, close: 2330.25, volume: 5678901, change: 15.35, changePercent: 0.66, marketCap: 2.7e12, pe: 68.4, pb: 8.2, sector: 'Conglomerate', industry: 'Trading', dividendYield: 0.1, high52w: 3743.90, low52w: 2025.60 },
  { symbol: 'HCLTECH', companyName: 'HCL Technologies Ltd', ltp: 1678.90, open: 1665.00, high: 1695.40, low: 1652.30, close: 1670.45, volume: 4567890, change: 8.45, changePercent: 0.51, marketCap: 4.5e12, pe: 24.6, pb: 6.8, sector: 'IT', industry: 'IT Services', dividendYield: 3.2, high52w: 1951.00, low52w: 1235.80 },
  { symbol: 'NTPC', companyName: 'NTPC Ltd', ltp: 345.60, open: 342.00, high: 348.80, low: 340.20, close: 343.45, volume: 12345678, change: 2.15, changePercent: 0.63, marketCap: 3.3e12, pe: 16.8, pb: 2.4, sector: 'Power', industry: 'Power Generation', dividendYield: 2.8, high52w: 424.80, low52w: 264.50 },
];

// ─── Market Movers ───────────────────────────────────────────────────────────

export const MOCK_GAINERS: MarketMover[] = [
  { symbol: 'TATASTEEL', companyName: 'Tata Steel', ltp: 145.60, change: 8.45, changePercent: 6.15 },
  { symbol: 'ADANIENT', companyName: 'Adani Enterprises', ltp: 2345.60, change: 98.30, changePercent: 4.37 },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors', ltp: 678.45, change: 24.80, changePercent: 3.79 },
  { symbol: 'BAJFINANCE', companyName: 'Bajaj Finance', ltp: 6789.50, change: 198.40, changePercent: 3.01 },
  { symbol: 'RELIANCE', companyName: 'Reliance Industries', ltp: 2876.45, change: 67.30, changePercent: 2.40 },
];

export const MOCK_LOSERS: MarketMover[] = [
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever', ltp: 2456.70, change: -78.50, changePercent: -3.10 },
  { symbol: 'NESTLEIND', companyName: 'Nestle India', ltp: 2456.30, change: -56.80, changePercent: -2.26 },
  { symbol: 'TITAN', companyName: 'Titan Company', ltp: 3456.70, change: -68.40, changePercent: -1.94 },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel', ltp: 1567.80, change: -28.60, changePercent: -1.79 },
  { symbol: 'ASIANPAINT', companyName: 'Asian Paints', ltp: 2890.50, change: -42.30, changePercent: -1.44 },
];

// ─── Portfolio Holdings ──────────────────────────────────────────────────────

export const MOCK_HOLDINGS: Holding[] = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries', quantity: 50, avgPrice: 2450.00, ltp: 2876.45, invested: 122500, currentValue: 143822.50, pnl: 21322.50, pnlPercent: 17.41, dayChange: 985.00, dayChangePercent: 0.69, sector: 'Oil & Gas' },
  { symbol: 'TCS', companyName: 'Tata Consultancy', quantity: 30, avgPrice: 3200.00, ltp: 3842.90, invested: 96000, currentValue: 115287.00, pnl: 19287.00, pnlPercent: 20.09, dayChange: 682.50, dayChangePercent: 0.60, sector: 'IT' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank', quantity: 100, avgPrice: 1450.00, ltp: 1678.30, invested: 145000, currentValue: 167830.00, pnl: 22830.00, pnlPercent: 15.74, dayChange: 780.00, dayChangePercent: 0.47, sector: 'Banking' },
  { symbol: 'INFY', companyName: 'Infosys', quantity: 80, avgPrice: 1380.00, ltp: 1567.85, invested: 110400, currentValue: 125428.00, pnl: 15028.00, pnlPercent: 13.61, dayChange: 608.00, dayChangePercent: 0.49, sector: 'IT' },
  { symbol: 'ITC', companyName: 'ITC', quantity: 200, avgPrice: 410.00, ltp: 467.25, invested: 82000, currentValue: 93450.00, pnl: 11450.00, pnlPercent: 13.96, dayChange: 620.00, dayChangePercent: 0.67, sector: 'FMCG' },
  { symbol: 'SUNPHARMA', companyName: 'Sun Pharmaceutical', quantity: 40, avgPrice: 1520.00, ltp: 1678.90, invested: 60800, currentValue: 67156.00, pnl: 6356.00, pnlPercent: 10.45, dayChange: 338.00, dayChangePercent: 0.51, sector: 'Pharma' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors', quantity: 150, avgPrice: 620.00, ltp: 678.45, invested: 93000, currentValue: 101767.50, pnl: 8767.50, pnlPercent: 9.43, dayChange: 645.00, dayChangePercent: 0.64, sector: 'Auto' },
  { symbol: 'SBIN', companyName: 'State Bank of India', quantity: 120, avgPrice: 680.00, ltp: 789.40, invested: 81600, currentValue: 94728.00, pnl: 13128.00, pnlPercent: 16.09, dayChange: 558.00, dayChangePercent: 0.59, sector: 'Banking' },
];

export function getMockPortfolioSummary(): PortfolioSummary {
  const totalInvested = MOCK_HOLDINGS.reduce((s, h) => s + h.invested, 0);
  const currentValue = MOCK_HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  const totalPnl = currentValue - totalInvested;
  const dayChange = MOCK_HOLDINGS.reduce((s, h) => s + h.dayChange, 0);
  return {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent: (totalPnl / totalInvested) * 100,
    dayChange,
    dayChangePercent: (dayChange / currentValue) * 100,
    holdings: MOCK_HOLDINGS,
  };
}

export function getMockSectorAllocation(): SectorAllocation[] {
  const sectorMap = new Map<string, number>();
  MOCK_HOLDINGS.forEach(h => {
    const sector = h.sector || 'Other';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.currentValue);
  });
  const total = MOCK_HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  return Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    value,
    percentage: (value / total) * 100,
    color: SECTOR_COLORS[sector] || '#6b7280',
  }));
}

// ─── Historical Candle Data ──────────────────────────────────────────────────

export function generateMockCandles(days: number = 365, basePrice: number = 2500): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 86400000;
    const volatility = 0.02;
    const drift = 0.0003;

    const change = price * (drift + volatility * (rand() - 0.5) * 2);
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + rand() * 0.01);
    const low = Math.min(open, close) * (1 - rand() * 0.01);
    const volume = Math.floor(5000000 + rand() * 15000000);

    candles.push({
      timestamp: Math.floor(timestamp / 1000),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
  }
  return candles;
}

// ─── Stock Detail ────────────────────────────────────────────────────────────

export function getMockStockDetail(symbol: string): StockDetail {
  const quote = MOCK_QUOTES.find(q => q.symbol === symbol) || MOCK_QUOTES[0];
  return {
    ...quote,
    description: `${quote.companyName} is one of India's leading companies in the ${quote.sector} sector, with a strong market presence and consistent growth trajectory.`,
    website: `https://www.${symbol.toLowerCase()}.com`,
    employees: 50000 + Math.floor(rand() * 200000),
    founded: `${1950 + Math.floor(rand() * 50)}`,
    ceo: 'CEO Name',
    roce: +(10 + rand() * 25).toFixed(1),
    roe: +(8 + rand() * 30).toFixed(1),
    debtToEquity: +(rand() * 1.5).toFixed(2),
    eps: +(quote.ltp / (quote.pe || 20)).toFixed(2),
    bookValue: +(quote.ltp / (quote.pb || 5)).toFixed(2),
    faceValue: [1, 2, 5, 10][Math.floor(rand() * 4)],
    promoterHolding: +(40 + rand() * 30).toFixed(1),
    fiiHolding: +(10 + rand() * 25).toFixed(1),
    diiHolding: +(5 + rand() * 20).toFixed(1),
    publicHolding: 0,
    financials: generateMockFinancials(),
  };
}

function generateMockFinancials(): StockDetail['financials'] {
  const periods = ['Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25', 'Q1 FY26'];
  return periods.map(period => ({
    period,
    revenue: +(50000 + rand() * 100000).toFixed(0),
    netProfit: +(5000 + rand() * 20000).toFixed(0),
    eps: +(20 + rand() * 60).toFixed(2),
    operatingMargin: +(12 + rand() * 18).toFixed(1),
  }));
}
