'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';

export interface HoldingRecord {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  quantity: number;
  buy_price: number;
  sector: string | null;
  notes: string | null;
  added_at: string;
  updated_at: string;
}

export interface EnrichedHolding extends HoldingRecord {
  ltp: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  change: number;
  changePercent: number;
}

interface PortfolioStore {
  holdings: EnrichedHolding[];
  isLoading: boolean;
  error: string | null;

  fetchHoldings: () => Promise<void>;
  addHolding: (data: { symbol: string; company_name: string; quantity: number; buy_price: number; sector?: string }) => Promise<{ error?: string }>;
  updateHolding: (id: string, data: { quantity?: number; buy_price?: number }) => Promise<{ error?: string }>;
  deleteHolding: (id: string) => Promise<{ error?: string }>;

  // Computed
  totalInvested: () => number;
  currentValue: () => number;
  totalPnl: () => number;
  totalPnlPercent: () => number;
  sectorAllocation: () => { sector: string; value: number; percentage: number; color: string }[];
}

const SECTOR_COLORS: Record<string, string> = {
  'IT': '#22d3ee',
  'Banking': '#8b5cf6',
  'Oil & Gas': '#f97316',
  'FMCG': '#eab308',
  'Pharma': '#10b981',
  'Auto': '#ef4444',
  'Metals': '#6b7280',
  'Telecom': '#ec4899',
  'Finance': '#3b82f6',
  'Infrastructure': '#14b8a6',
  'Power': '#f59e0b',
  'Consumer': '#a855f7',
  'Conglomerate': '#64748b',
};

function enrichHolding(h: HoldingRecord): EnrichedHolding {
  const quote = MOCK_QUOTES.find(q => q.symbol === h.symbol);
  const ltp = quote?.ltp || h.buy_price * 1.1;
  const invested = h.quantity * h.buy_price;
  const currentValue = h.quantity * ltp;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  return {
    ...h,
    ltp,
    invested,
    currentValue,
    pnl,
    pnlPercent,
    change: quote?.change || 0,
    changePercent: quote?.changePercent || 0,
  };
}

export const usePortfolioStore = create<PortfolioStore>()((set, get) => ({
  holdings: [],
  isLoading: false,
  error: null,

  fetchHoldings: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const enriched = (data || []).map(enrichHolding);
    set({ holdings: enriched, isLoading: false });
  },

  addHolding: async (formData) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('holdings')
      .insert({
        user_id: user.id,
        symbol: formData.symbol,
        company_name: formData.company_name,
        quantity: formData.quantity,
        buy_price: formData.buy_price,
        sector: formData.sector || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const enriched = enrichHolding(data);
    set((state) => ({ holdings: [enriched, ...state.holdings] }));
    return {};
  },

  updateHolding: async (id, updates) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('holdings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };

    const enriched = enrichHolding(data);
    set((state) => ({
      holdings: state.holdings.map(h => h.id === id ? enriched : h),
    }));
    return {};
  },

  deleteHolding: async (id) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('holdings')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };

    set((state) => ({
      holdings: state.holdings.filter(h => h.id !== id),
    }));
    return {};
  },

  totalInvested: () => get().holdings.reduce((s, h) => s + h.invested, 0),
  currentValue: () => get().holdings.reduce((s, h) => s + h.currentValue, 0),
  totalPnl: () => {
    const invested = get().totalInvested();
    return get().currentValue() - invested;
  },
  totalPnlPercent: () => {
    const invested = get().totalInvested();
    return invested > 0 ? (get().totalPnl() / invested) * 100 : 0;
  },
  sectorAllocation: () => {
    const holdings = get().holdings;
    const total = holdings.reduce((s, h) => s + h.currentValue, 0);
    const map = new Map<string, number>();
    holdings.forEach(h => {
      const sector = h.sector || 'Other';
      map.set(sector, (map.get(sector) || 0) + h.currentValue);
    });
    return Array.from(map.entries()).map(([sector, value]) => ({
      sector,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: SECTOR_COLORS[sector] || '#6b7280',
    }));
  },
}));
