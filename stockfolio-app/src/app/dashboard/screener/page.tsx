'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, Star, X } from 'lucide-react';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';
import { SECTORS } from '@/lib/utils/constants';
import { formatCurrency, formatPercent, formatMarketCap, getChangeColor, getChangeBg } from '@/lib/utils/formatters';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';

type SortKey = 'symbol' | 'ltp' | 'changePercent' | 'marketCap' | 'pe' | 'volume';
type SortDir = 'asc' | 'desc';

export default function ScreenerPage() {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sector, setSector] = useState('');
  const [peRange, setPeRange] = useState<[number, number]>([0, 100]);
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = useMemo(() => {
    let stocks = [...MOCK_QUOTES];

    if (search) {
      const q = search.toLowerCase();
      stocks = stocks.filter(s =>
        s.symbol.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q)
      );
    }

    if (sector) {
      stocks = stocks.filter(s => s.sector === sector);
    }

    stocks = stocks.filter(s => {
      const pe = s.pe || 0;
      return pe >= peRange[0] && pe <= peRange[1];
    });

    stocks.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return stocks;
  }, [search, sector, peRange, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortKey === field ? 'text-cyan-400' : 'text-zinc-600'}`} />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Screener</h1>
        <p className="text-sm text-zinc-500 mt-1">Filter and discover stocks across NSE/BSE</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol or company name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-700 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:border-cyan-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'glass hover:bg-white/5 text-zinc-300'
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
              >
                <option value="">All Sectors</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">PE Ratio Min</label>
              <input
                type="number"
                value={peRange[0]}
                onChange={(e) => setPeRange([+e.target.value, peRange[1]])}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">PE Ratio Max</label>
              <input
                type="number"
                value={peRange[1]}
                onChange={(e) => setPeRange([peRange[0], +e.target.value])}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
              />
            </div>
          </div>
          <button
            onClick={() => { setSearch(''); setSector(''); setPeRange([0, 100]); }}
            className="mt-3 text-xs text-zinc-500 hover:text-white flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        </motion.div>
      )}

      {/* Results count */}
      <div className="text-sm text-zinc-500">
        Showing {filtered.length} stocks
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th className="cursor-pointer" onClick={() => handleSort('symbol')}>Stock <SortIcon field="symbol" /></th>
                <th className="text-right cursor-pointer" onClick={() => handleSort('ltp')}>Price <SortIcon field="ltp" /></th>
                <th className="text-right cursor-pointer" onClick={() => handleSort('changePercent')}>Change <SortIcon field="changePercent" /></th>
                <th className="text-right cursor-pointer" onClick={() => handleSort('marketCap')}>Market Cap <SortIcon field="marketCap" /></th>
                <th className="text-right cursor-pointer" onClick={() => handleSort('pe')}>PE <SortIcon field="pe" /></th>
                <th className="text-right cursor-pointer" onClick={() => handleSort('volume')}>Volume <SortIcon field="volume" /></th>
                <th className="text-right">52W Range</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <button
                      onClick={() => isInWatchlist(stock.symbol) ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol)}
                      className="p-1"
                    >
                      <Star className={`w-4 h-4 ${isInWatchlist(stock.symbol) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600 hover:text-zinc-400'}`} />
                    </button>
                  </td>
                  <td>
                    <Link href={`/dashboard/stock/${stock.symbol}`} className="hover:text-cyan-400 transition-colors">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-zinc-500 max-w-[180px] truncate">{stock.companyName}</div>
                    </Link>
                  </td>
                  <td className="text-right font-medium">{formatCurrency(stock.ltp)}</td>
                  <td className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${getChangeBg(stock.changePercent)}`}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </td>
                  <td className="text-right text-zinc-300">{stock.marketCap ? formatMarketCap(stock.marketCap) : '—'}</td>
                  <td className="text-right text-zinc-300">{stock.pe?.toFixed(1) ?? '—'}</td>
                  <td className="text-right text-zinc-400">{(stock.volume / 1e6).toFixed(1)}M</td>
                  <td className="text-right">
                    <div className="text-xs text-zinc-500">
                      {stock.low52w ? formatCurrency(stock.low52w) : '—'} - {stock.high52w ? formatCurrency(stock.high52w) : '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
