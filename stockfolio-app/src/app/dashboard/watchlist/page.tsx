'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Search, Plus, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { NIFTY_50_STOCKS } from '@/lib/utils/constants';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';
import { formatCurrency, formatPercent, getChangeColor, getChangeBg, timeAgo } from '@/lib/utils/formatters';

export default function WatchlistPage() {
  const { items, addToWatchlist, removeFromWatchlist, fetchFromSupabase } = useWatchlistStore();

  // Load authoritative data from Supabase on mount (overrides localStorage cache)
  useEffect(() => { fetchFromSupabase(); }, [fetchFromSupabase]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = search.length >= 1
    ? NIFTY_50_STOCKS.filter(s =>
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase())
      ).filter(s => !items.some(i => i.symbol === s.symbol))
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-sm text-zinc-500 mt-1">Track your favorite stocks</p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Stock
        </button>
      </div>

      {/* Search to add */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a stock to add..."
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-700 border border-zinc-800 text-white placeholder-zinc-500 text-sm"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-1 max-h-[200px] overflow-y-auto">
                {searchResults.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => { addToWatchlist(s.symbol); setSearch(''); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <div>
                      <div className="text-sm font-medium">{s.symbol}</div>
                      <div className="text-xs text-zinc-500">{s.name}</div>
                    </div>
                    <Plus className="w-4 h-4 text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist Items */}
      {items.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Star className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">Your watchlist is empty</h3>
          <p className="text-sm text-zinc-500 mb-6">Add stocks to start tracking their prices</p>
          <button
            onClick={() => setShowSearch(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold"
          >
            Add Your First Stock
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {items.map((item, i) => {
              const quote = MOCK_QUOTES.find(q => q.symbol === item.symbol);
              const ltp = quote?.ltp || item.ltp;
              const change = quote?.change || item.change;
              const changePercent = quote?.changePercent || item.changePercent;

              return (
                <motion.div
                  key={item.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <Link href={`/dashboard/stock/${item.symbol}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        {changePercent >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">{item.symbol}</div>
                        <div className="text-xs text-zinc-500 truncate">{item.companyName}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold">{formatCurrency(ltp)}</div>
                    <div className={`text-xs font-medium ${getChangeColor(changePercent)}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)} ({formatPercent(changePercent)})
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href="/dashboard/alerts"
                      className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.symbol)}
                      className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
