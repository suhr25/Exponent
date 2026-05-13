'use client';

import { motion } from 'framer-motion';
import { Globe2, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { useLivePrices } from '@/lib/hooks/useLivePrices';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils/formatters';

const PAGE_SIZE = 30;

export default function AllStocksPage() {
  const { stocks, searchStocks, getSectors } = useStocksStore();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [mcapFilter, setMcapFilter] = useState('All');
  const [page, setPage] = useState(1);
  const router = useRouter();

  const sectors = useMemo(() => ['All', ...getSectors()], [getSectors]);

  const filtered = useMemo(() => {
    let result = search.length >= 1 ? searchStocks(search) : stocks;
    if (sectorFilter !== 'All') result = result.filter(s => s.sector === sectorFilter);
    if (mcapFilter !== 'All') result = result.filter(s => s.mcap === mcapFilter);
    return result;
  }, [stocks, search, sectorFilter, mcapFilter, searchStocks]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedStocks = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Fetch REAL prices for current page
  const symbolsOnPage = useMemo(() => paginatedStocks.map(s => s.sym), [paginatedStocks]);
  const { prices, loading: pricesLoading } = useLivePrices(symbolsOnPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-cyan-400" /> All Stocks
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {filtered.length} of {stocks.length} stocks · Real-time prices from NSE
          </p>
        </div>
        {pricesLoading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or symbol..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-zinc-600"
          />
        </div>
        <select
          value={sectorFilter}
          onChange={e => { setSectorFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-300"
        >
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={mcapFilter}
          onChange={e => { setMcapFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-300"
        >
          <option value="All">All Cap</option>
          <option value="large">Large Cap</option>
          <option value="mid">Mid Cap</option>
          <option value="small">Small Cap</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Company</th>
                <th className="text-right">Price</th>
                <th className="text-right">Change</th>
                <th>Sector</th>
                <th>Cap</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock, i) => {
                const p = prices.get(stock.sym);
                return (
                  <tr
                    key={`${stock.sym}-${i}`}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/stock/${stock.sym}`)}
                  >
                    <td className="text-zinc-600">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <span className="font-semibold text-cyan-400">{stock.sym}</span>
                    </td>
                    <td className="text-zinc-300">{stock.name}</td>
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
                    <td>
                      <span className="text-xs px-2 py-1 rounded-lg bg-white/[0.04] text-zinc-400">{stock.sector}</span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        stock.mcap === 'large' ? 'bg-cyan-500/10 text-cyan-400' :
                        stock.mcap === 'mid' ? 'bg-violet-500/10 text-violet-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {stock.mcap === 'large' ? 'Large' : stock.mcap === 'mid' ? 'Mid' : 'Small'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.03]">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-3 h-3" /> Previous
            </button>
            <span className="text-xs text-zinc-500">Page {page} of {totalPages} ({filtered.length} stocks)</span>
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
