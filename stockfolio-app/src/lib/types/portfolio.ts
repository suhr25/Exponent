// ─── Portfolio Types ─────────────────────────────────────────────────────────

export interface Holding {
  symbol: string;
  companyName: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
  sector?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: Holding[];
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
  ltp: number;
  change: number;
  changePercent: number;
  addedAt: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'pct_above' | 'pct_below';
  value: number;
  active: boolean;
  triggered: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  totalInvested: number;
  pnl: number;
  holdingsCount: number;
}
