'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistItem, PriceAlert } from '@/lib/types/portfolio';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';

interface WatchlistStore {
  items: WatchlistItem[];
  alerts: PriceAlert[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  createAlert: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      alerts: [],

      addToWatchlist: (symbol: string) => {
        if (get().isInWatchlist(symbol)) return;
        const quote = MOCK_QUOTES.find(q => q.symbol === symbol);
        if (!quote) return;
        set((state) => ({
          items: [...state.items, {
            symbol: quote.symbol,
            companyName: quote.companyName,
            ltp: quote.ltp,
            change: quote.change,
            changePercent: quote.changePercent,
            addedAt: Date.now(),
          }],
        }));
      },

      removeFromWatchlist: (symbol: string) => {
        set((state) => ({
          items: state.items.filter(i => i.symbol !== symbol),
        }));
      },

      isInWatchlist: (symbol: string) => {
        return get().items.some(i => i.symbol === symbol);
      },

      createAlert: (alert) => {
        set((state) => ({
          alerts: [...state.alerts, {
            ...alert,
            id: crypto.randomUUID(),
            triggered: false,
            createdAt: Date.now(),
          }],
        }));
      },

      deleteAlert: (id: string) => {
        set((state) => ({
          alerts: state.alerts.filter(a => a.id !== id),
        }));
      },

      toggleAlert: (id: string) => {
        set((state) => ({
          alerts: state.alerts.map(a =>
            a.id === id ? { ...a, active: !a.active } : a
          ),
        }));
      },
    }),
    { name: 'Exponent-watchlist' }
  )
);
