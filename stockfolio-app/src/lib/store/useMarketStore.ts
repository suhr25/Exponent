'use client';

import { create } from 'zustand';
import type { StockQuote, MarketIndex, MarketMover } from '@/lib/types/market';
import { MOCK_INDICES, MOCK_QUOTES, MOCK_GAINERS, MOCK_LOSERS } from '@/lib/utils/mock-data';

interface MarketStore {
  indices: MarketIndex[];
  quotes: Map<string, StockQuote>;
  gainers: MarketMover[];
  losers: MarketMover[];
  isLoading: boolean;
  lastUpdated: number | null;
  fetchMarketData: () => Promise<void>;
  getQuote: (symbol: string) => StockQuote | undefined;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  indices: [],
  quotes: new Map(),
  gainers: [],
  losers: [],
  isLoading: false,
  lastUpdated: null,

  fetchMarketData: async () => {
    set({ isLoading: true });
    try {
      // Try fetching from our API proxy
      const res = await fetch('/api/market/quote?symbols=RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK');
      if (res.ok) {
        const data = await res.json();
        if (data.quotes) {
          const quotesMap = new Map<string, StockQuote>();
          data.quotes.forEach((q: StockQuote) => quotesMap.set(q.symbol, q));
          set({
            quotes: quotesMap,
            indices: data.indices || MOCK_INDICES,
            gainers: data.gainers || MOCK_GAINERS,
            losers: data.losers || MOCK_LOSERS,
            isLoading: false,
            lastUpdated: Date.now(),
          });
          return;
        }
      }
    } catch {
      // Fallback to mock data
    }

    // Use mock data as fallback
    const quotesMap = new Map<string, StockQuote>();
    MOCK_QUOTES.forEach(q => quotesMap.set(q.symbol, q));
    set({
      indices: MOCK_INDICES,
      quotes: quotesMap,
      gainers: MOCK_GAINERS,
      losers: MOCK_LOSERS,
      isLoading: false,
      lastUpdated: Date.now(),
    });
  },

  getQuote: (symbol: string) => {
    return get().quotes.get(symbol);
  },
}));
