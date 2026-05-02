'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { getMockStockDetail } from '@/lib/utils/mock-data';
import { formatCurrency, formatMarketCap, getChangeColor, formatPercent } from '@/lib/utils/formatters';

const SECTORS = [
  'All Sectors', 'Financials', 'Information Technology', 'Energy', 
  'Consumer Discretionary', 'Consumer Staples', 'Industrials', 
  'Healthcare', 'Materials', 'Telecommunications', 'Utilities', 'Real Estate'
];

type SortField = 'symbol' | 'ltp' | 'changePercent' | 'marketCap' | 'pe' | 'roe';
type SortOrder = 'asc' | 'desc';

export default function ScreenerPage() {
  const { stocks } = useStocksStore();
  
  // Filters
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All Sectors');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPe, setMinPe] = useState('');
  const [maxPe, setMaxPe] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const detailedStocks = useMemo(() => stocks.map(s => getMockStockDetail(s.sym)), [stocks]);

  const filteredAndSorted = useMemo(() => {
    return detailedStocks
      .filter((s) => {
        if (search && !s.symbol.toLowerCase().includes(search.toLowerCase()) && !s.companyName.toLowerCase().includes(search.toLowerCase())) return false;
        if (sector !== 'All Sectors' && s.sector !== sector) return false;
        if (minPrice && s.ltp < parseFloat(minPrice)) return false;
        if (maxPrice && s.ltp > parseFloat(maxPrice)) return false;
        if (minPe && (!s.pe || s.pe < parseFloat(minPe))) return false;
        if (maxPe && (!s.pe || s.pe > parseFloat(maxPe))) return false;
        return true;
      })
      .sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let valA: any = a[sortField];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let valB: any = b[sortField];
        
        if (valA === undefined || valA === null) valA = sortOrder === 'asc' ? Infinity : -Infinity;
        if (valB === undefined || valB === null) valB = sortOrder === 'asc' ? Infinity : -Infinity;

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [detailedStocks, search, sector, minPrice, maxPrice, minPe, maxPe, sortField, sortOrder]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Stock Screener</h1>
          <p className="text-sm text-zinc-500">Filter and discover stocks based on your criteria</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search symbol or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:border-cyan-500/50 focus:outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-semibold hover:bg-white/[0.06] transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
          >
            {SECTORS.map(s => <option key={s} value={s} className="bg-[#0c0c14]">{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Price Range (₹)</label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
            <span className="text-zinc-600">-</span>
            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">P/E Ratio</label>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPe} onChange={e => setMinPe(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
            <span className="text-zinc-600">-</span>
            <input type="number" placeholder="Max" value={maxPe} onChange={e => setMaxPe(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
          </div>
        </div>
        <div className="flex-none">
          <button
            onClick={() => { setSector('All Sectors'); setMinPrice(''); setMaxPrice(''); setMinPe(''); setMaxPe(''); setSearch(''); }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{filteredAndSorted.length} Results Found</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th onClick={() => handleSort('symbol')} className="cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-1">Company <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th onClick={() => handleSort('ltp')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Price <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th onClick={() => handleSort('changePercent')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Change <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th onClick={() => handleSort('marketCap')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Market Cap <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th onClick={() => handleSort('pe')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">P/E <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th onClick={() => handleSort('roe')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">ROE <ArrowUpDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" /></div>
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((stock) => (
                <tr key={stock.symbol} className="group">
                  <td>
                    <div>
                      <Link href={`/dashboard/stock/${stock.symbol}`} className="font-bold text-white hover:text-cyan-400 transition-colors">
                        {stock.symbol}
                      </Link>
                      <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">{stock.companyName}</div>
                    </div>
                  </td>
                  <td className="text-right font-mono font-medium">{formatCurrency(stock.ltp)}</td>
                  <td className="text-right font-mono">
                    <span className={getChangeColor(stock.changePercent)}>
                      {stock.changePercent > 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                    </span>
                  </td>
                  <td className="text-right font-mono text-zinc-300">{stock.marketCap ? formatMarketCap(stock.marketCap) : '—'}</td>
                  <td className="text-right font-mono text-zinc-400">{stock.pe?.toFixed(2) || '—'}</td>
                  <td className="text-right font-mono text-zinc-400">{stock.roe ? `${stock.roe.toFixed(2)}%` : '—'}</td>
                  <td className="text-right">
                    <Link href={`/dashboard/stock/${stock.symbol}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] text-zinc-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/10 hover:text-cyan-400">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3">
                      <Filter className="w-5 h-5 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400">No stocks match your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
