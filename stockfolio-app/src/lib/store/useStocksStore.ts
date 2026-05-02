'use client';

import { create } from 'zustand';
import Fuse from 'fuse.js';
import bseStocksData from '@/data/bse_stocks.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BseStock {
  sc: string;       // scrip code
  sym: string;      // symbol
  name: string;     // company name
  sector: string;
  industry: string;
  nse: string;      // NSE symbol
  isin: string;
  mcap: 'large' | 'mid' | 'small';
}

export interface PriceData {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  updatedAt: number;
}

export interface StockWithPrice extends BseStock {
  price?: PriceData;
}

// ─── Fuse.js Search Index ────────────────────────────────────────────────────

const allStocks: BseStock[] = bseStocksData as BseStock[];

const fuseIndex = new Fuse(allStocks, {
  keys: [
    { name: 'sym', weight: 0.4 },
    { name: 'name', weight: 0.4 },
    { name: 'sc', weight: 0.1 },
    { name: 'sector', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
});

// ─── Zustand Store ───────────────────────────────────────────────────────────

interface StocksStore {
  stocks: BseStock[];
  priceCache: Map<string, PriceData>;
  recentSearches: string[];

  // Getters
  getStock: (symbol: string) => BseStock | undefined;
  getPrice: (symbol: string) => PriceData | undefined;
  getStockWithPrice: (symbol: string) => StockWithPrice | undefined;

  // Search
  searchStocks: (query: string) => BseStock[];

  // Price management
  updatePrices: (updates: Record<string, PriceData>) => void;
  updatePrice: (symbol: string, price: PriceData) => void;

  // Recent searches
  addRecentSearch: (symbol: string) => void;
  clearRecentSearches: () => void;

  // Sector/filter helpers
  getStocksBySector: (sector: string) => BseStock[];
  getStocksByMcap: (mcap: 'large' | 'mid' | 'small') => BseStock[];
  getSectors: () => string[];
}

// Build lookup maps for O(1) access
const stocksBySymbol = new Map<string, BseStock>();
const stocksBySector = new Map<string, BseStock[]>();

allStocks.forEach(stock => {
  stocksBySymbol.set(stock.sym, stock);
  const existing = stocksBySector.get(stock.sector) || [];
  existing.push(stock);
  stocksBySector.set(stock.sector, existing);
});

// Load recent searches from localStorage
function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('exponent_recent_searches');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('exponent_recent_searches', JSON.stringify(searches));
  } catch { /* ignore */ }
}

export const useStocksStore = create<StocksStore>()((set, get) => ({
  stocks: allStocks,
  priceCache: new Map(),
  recentSearches: loadRecentSearches(),

  getStock: (symbol: string) => stocksBySymbol.get(symbol),

  getPrice: (symbol: string) => get().priceCache.get(symbol),

  getStockWithPrice: (symbol: string) => {
    const stock = stocksBySymbol.get(symbol);
    if (!stock) return undefined;
    return { ...stock, price: get().priceCache.get(symbol) };
  },

  searchStocks: (query: string) => {
    if (!query || query.length < 1) return [];
    const results = fuseIndex.search(query, { limit: 10 });
    return results.map(r => r.item);
  },

  updatePrices: (updates: Record<string, PriceData>) => {
    set((state) => {
      const newCache = new Map(state.priceCache);
      Object.entries(updates).forEach(([symbol, price]) => {
        newCache.set(symbol, price);
      });
      return { priceCache: newCache };
    });
  },

  updatePrice: (symbol: string, price: PriceData) => {
    set((state) => {
      const newCache = new Map(state.priceCache);
      newCache.set(symbol, price);
      return { priceCache: newCache };
    });
  },

  addRecentSearch: (symbol: string) => {
    set((state) => {
      const filtered = state.recentSearches.filter(s => s !== symbol);
      const updated = [symbol, ...filtered].slice(0, 10);
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    saveRecentSearches([]);
    set({ recentSearches: [] });
  },

  getStocksBySector: (sector: string) => stocksBySector.get(sector) || [],

  getStocksByMcap: (mcap: 'large' | 'mid' | 'small') => allStocks.filter(s => s.mcap === mcap),

  getSectors: () => Array.from(stocksBySector.keys()).sort(),
}));
