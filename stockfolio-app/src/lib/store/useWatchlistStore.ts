'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistItem, PriceAlert } from '@/lib/types/portfolio';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';
import { createClient } from '@/lib/supabase/client';

interface WatchlistStore {
  items: WatchlistItem[];
  alerts: PriceAlert[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  createAlert: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  // Loads authoritative data from Supabase, overrides local cache
  fetchFromSupabase: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      alerts: [],

      fetchFromSupabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [watchlistRes, alertsRes] = await Promise.allSettled([
          supabase
            .from('watchlist')
            .select('*')
            .eq('user_id', user.id)
            .order('added_at', { ascending: false }),
          supabase
            .from('alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (watchlistRes.status === 'fulfilled' && watchlistRes.value.data) {
          const items: WatchlistItem[] = watchlistRes.value.data.map(row => {
            const quote = MOCK_QUOTES.find(q => q.symbol === row.symbol);
            return {
              symbol: row.symbol,
              companyName: row.company_name,
              ltp: quote?.ltp ?? 0,
              change: quote?.change ?? 0,
              changePercent: quote?.changePercent ?? 0,
              addedAt: new Date(row.added_at).getTime(),
            };
          });
          set({ items });
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value.data) {
          const alerts: PriceAlert[] = alertsRes.value.data.map(row => ({
            id: row.id,
            symbol: row.symbol,
            condition: row.condition as PriceAlert['condition'],
            value: Number(row.target_price),
            active: row.active,
            triggered: row.triggered,
            createdAt: new Date(row.created_at).getTime(),
            triggeredAt: row.triggered_at
              ? new Date(row.triggered_at).getTime()
              : undefined,
          }));
          set({ alerts });
        }
      },

      addToWatchlist: (symbol: string) => {
        if (get().isInWatchlist(symbol)) return;
        const quote = MOCK_QUOTES.find(q => q.symbol === symbol);
        if (!quote) return;

        const item: WatchlistItem = {
          symbol: quote.symbol,
          companyName: quote.companyName,
          ltp: quote.ltp,
          change: quote.change,
          changePercent: quote.changePercent,
          addedAt: Date.now(),
        };

        set(state => ({ items: [...state.items, item] }));

        // Fire-and-forget Supabase sync
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase
            .from('watchlist')
            .insert({ user_id: user.id, symbol: item.symbol, company_name: item.companyName })
            .then();
        });
      },

      removeFromWatchlist: (symbol: string) => {
        set(state => ({ items: state.items.filter(i => i.symbol !== symbol) }));

        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase.from('watchlist').delete().eq('user_id', user.id).eq('symbol', symbol).then();
        });
      },

      isInWatchlist: (symbol: string) => get().items.some(i => i.symbol === symbol),

      createAlert: (alert) => {
        // Use a client-generated UUID so local state and Supabase share the same ID
        const id = crypto.randomUUID();
        const newAlert: PriceAlert = {
          ...alert,
          id,
          triggered: false,
          createdAt: Date.now(),
        };

        set(state => ({ alerts: [...state.alerts, newAlert] }));

        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user) return;
          supabase
            .from('alerts')
            .insert({
              id,
              user_id: user.id,
              symbol: alert.symbol,
              condition: alert.condition,
              target_price: alert.value,
              active: alert.active ?? true,
            })
            .then();
        });
      },

      deleteAlert: (id: string) => {
        set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
        createClient().from('alerts').delete().eq('id', id).then();
      },

      toggleAlert: (id: string) => {
        const current = get().alerts.find(a => a.id === id);
        if (!current) return;
        const newActive = !current.active;
        set(state => ({
          alerts: state.alerts.map(a => (a.id === id ? { ...a, active: newActive } : a)),
        }));
        createClient().from('alerts').update({ active: newActive }).eq('id', id).then();
      },
    }),
    { name: 'Exponent-watchlist' }
  )
);
