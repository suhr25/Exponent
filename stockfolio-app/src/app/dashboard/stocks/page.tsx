'use client';

import { motion } from 'framer-motion';
import { Globe2, Search } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { useState, useMemo } from 'react';

export default function AllStocksPage() {
  const { stocks } = useStocksStore();
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [mcapFilter, setMcapFilter] = useState('All');
  const { searchStocks, getSectors } = useStocksStore();

  const sectors = useMemo(() => ['All', ...getSectors()], [getSectors]);

  const filtered = useMemo(() => {
    let result = search.length >= 1 ? searchStocks(search) : stocks;
    if (sectorFilter !== 'All') result = result.filter(s => s.sector === sectorFilter);
    if (mcapFilter !== 'All') result = result.filter(s => s.mcap === mcapFilter);
    return result;
  }, [stocks, search, sectorFilter, mcapFilter, searchStocks]);

  const advancing = Math.floor(stocks.length * 0.48);
  const declining = Math.floor(stocks.length * 0.41);
  const unchanged = stocks.length - advancing - declining;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-cyan-400" /> All Stocks
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Showing {filtered.length} of {stocks.length} stocks · {advancing} advancing · {declining} declining · {unchanged} unchanged
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or symbol..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-zinc-600"
          />
        </div>
        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-300"
        >
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={mcapFilter}
          onChange={e => setMcapFilter(e.target.value)}
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
                <th>Sector</th>
                <th>Market Cap</th>
                <th>Exchange</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((stock, i) => (
                <tr key={stock.sym} className="cursor-pointer" onClick={() => window.location.href = `/dashboard/stock/${stock.sym}`}>
                  <td className="text-zinc-600">{i + 1}</td>
                  <td>
                    <span className="font-semibold text-cyan-400">{stock.sym}</span>
                  </td>
                  <td className="text-zinc-300">{stock.name}</td>
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
                  <td className="text-xs text-zinc-500">{stock.nse ? 'NSE' : 'BSE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="px-5 py-3 text-center text-xs text-zinc-600 border-t border-white/[0.03]">
            Showing 100 of {filtered.length} results. Use search to narrow down.
          </div>
        )}
      </div>
    </motion.div>
  );
}
