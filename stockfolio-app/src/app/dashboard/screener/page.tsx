'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { useLivePrices } from '@/lib/hooks/useLivePrices';
import { formatCurrency, formatMarketCap, getChangeColor, formatPercent } from '@/lib/utils/formatters';

type SortField = 'symbol' | 'ltp' | 'changePercent' | 'marketCap' | 'sector';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE = 30; // Smaller page since we fetch real prices per page

export default function ScreenerPage() {
  const { stocks, getSectors } = useStocksStore();
  const sectors = useMemo(() => ['All Sectors', ...getSectors()], [getSectors]);

  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All Sectors');
  const [mcapFilter, setMcapFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'symbol' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  // Filter stocks from the static list first
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      if (search && !s.sym.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (sector !== 'All Sectors' && s.sector !== sector) return false;
      if (mcapFilter !== 'All' && s.mcap !== mcapFilter) return false;
      return true;
    });
  }, [stocks, search, sector, mcapFilter]);

  const totalPages = Math.ceil(filteredStocks.length / PAGE_SIZE);
  const paginatedStocks = filteredStocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Fetch REAL prices for the current page of stocks only
  const symbolsOnPage = useMemo(() => paginatedStocks.map(s => s.sym), [paginatedStocks]);
  const { prices, loading: pricesLoading } = useLivePrices(symbolsOnPage);

  // Sort by real price data if available
  const sortedStocks = useMemo(() => {
    if (sortField === 'symbol' || sortField === 'sector') {
      return [...paginatedStocks].sort((a, b) => {
        const valA = sortField === 'symbol' ? a.sym : a.sector;
        const valB = sortField === 'symbol' ? b.sym : b.sector;
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    // Sort by price data
    return [...paginatedStocks].sort((a, b) => {
      const pa = prices.get(a.sym);
      const pb = prices.get(b.sym);
      let valA = 0, valB = 0;
      if (sortField === 'ltp') { valA = pa?.ltp || 0; valB = pb?.ltp || 0; }
      if (sortField === 'changePercent') { valA = pa?.changePercent || 0; valB = pb?.changePercent || 0; }
      if (sortField === 'marketCap') { valA = pa?.ltp || 0; valB = pb?.ltp || 0; } // Market cap needs separate fetch
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [paginatedStocks, prices, sortField, sortOrder]);

  const inputCls = "w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50";

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`w-3 h-3 transition-colors ${sortField === field ? 'text-cyan-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Stock Screener</h1>
          <p className="text-sm text-zinc-500">Real-time prices from NSE/BSE via Yahoo Finance</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search symbol or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:border-cyan-500/50 focus:outline-none w-full md:w-72 transition-all"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Sector</label>
            <select value={sector} onChange={(e) => { setSector(e.target.value); setPage(1); }} className={inputCls}>
              {sectors.map(s => <option key={s} value={s} className="bg-[#0c0c14]">{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Market Cap</label>
            <select value={mcapFilter} onChange={(e) => { setMcapFilter(e.target.value); setPage(1); }} className={inputCls}>
              <option value="All" className="bg-[#0c0c14]">All Cap</option>
              <option value="large" className="bg-[#0c0c14]">Large Cap</option>
              <option value="mid" className="bg-[#0c0c14]">Mid Cap</option>
              <option value="small" className="bg-[#0c0c14]">Small Cap</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setSector('All Sectors'); setMcapFilter('All'); setSearch(''); setPage(1); }} className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white">{filteredStocks.length} Stocks</h2>
            {pricesLoading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
            <span className="text-[10px] text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <span className="text-xs text-zinc-500">Page {page} of {totalPages || 1}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th onClick={() => handleSort('symbol')} className="cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-1">Company <SortIcon field="symbol" /></div>
                </th>
                <th onClick={() => handleSort('ltp')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Price <SortIcon field="ltp" /></div>
                </th>
                <th onClick={() => handleSort('changePercent')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Change <SortIcon field="changePercent" /></div>
                </th>
                <th className="text-right">Volume</th>
                <th onClick={() => handleSort('sector')} className="text-right cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center justify-end gap-1">Sector <SortIcon field="sector" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map((stock) => {
                const p = prices.get(stock.sym);
                return (
                  <tr key={stock.sym} className="group">
                    <td>
                      <Link href={`/dashboard/stock/${stock.sym}`} className="block">
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{stock.sym}</span>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">{stock.name}</div>
                      </Link>
                    </td>
                    <td className="text-right font-mono font-medium">
                      {p ? formatCurrency(p.ltp) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="text-right font-mono">
                      {p ? (
                        <span className={getChangeColor(p.changePercent)}>
                          {p.changePercent > 0 ? '+' : ''}{formatPercent(p.changePercent)}
                        </span>
                      ) : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="text-right font-mono text-zinc-400 text-xs">
                      {p ? (p.volume > 0 ? (p.volume / 1e6).toFixed(1) + 'M' : '—') : '—'}
                    </td>
                    <td className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-zinc-500 border border-white/[0.04]">{stock.sector}</span>
                    </td>
                  </tr>
                );
              })}
              {sortedStocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-3 h-3" /> Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pn: number;
                if (totalPages <= 7) pn = i + 1;
                else if (page <= 4) pn = i + 1;
                else if (page >= totalPages - 3) pn = totalPages - 6 + i;
                else pn = page - 3 + i;
                return (
                  <button key={pn} onClick={() => setPage(pn)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${pn === page ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'}`}>
                    {pn}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
