// ─── Market Data Types ───────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  companyName: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  pe?: number;
  pb?: number;
  dividendYield?: number;
  high52w?: number;
  low52w?: number;
  sector?: string;
  industry?: string;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  status: 'up' | 'down' | 'flat';
}

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange: string;
  sector?: string;
  isin?: string;
}

export interface MarketMover {
  symbol: string;
  companyName: string;
  ltp: number;
  change: number;
  changePercent: number;
}

export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '1D' | '1W' | '1M';
export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

export interface ScreenerFilter {
  peMin?: number;
  peMax?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  roceMin?: number;
  roceMax?: number;
  rsiMin?: number;
  rsiMax?: number;
  sector?: string;
  industry?: string;
  dividendYieldMin?: number;
}

// Stock detail with full financial data
export interface StockDetail extends StockQuote {
  description: string;
  website: string;
  employees: number;
  founded: string;
  ceo: string;
  roce: number;
  roe: number;
  debtToEquity: number;
  eps: number;
  bookValue: number;
  faceValue: number;
  promoterHolding: number;
  fiiHolding: number;
  diiHolding: number;
  publicHolding: number;
  financials: FinancialData[];
}

export interface FinancialData {
  period: string;
  revenue: number;
  netProfit: number;
  eps: number;
  operatingMargin: number;
}
