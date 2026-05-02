'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarDays, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

interface DividendStock {
  symbol: string;
  name: string;
  exDate: string;
  recordDate: string;
  dividendAmount: number;
  dividendYield: number;
  ltp: number;
  type: 'Interim' | 'Final' | 'Special';
}

const MOCK_DIVIDENDS: DividendStock[] = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', exDate: '2026-05-15', recordDate: '2026-05-16', dividendAmount: 28, dividendYield: 1.8, ltp: 3480, type: 'Final' },
  { symbol: 'INFY', name: 'Infosys Ltd', exDate: '2026-05-12', recordDate: '2026-05-13', dividendAmount: 18.5, dividendYield: 2.1, ltp: 1520, type: 'Final' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exDate: '2026-05-20', recordDate: '2026-05-21', dividendAmount: 19.5, dividendYield: 1.2, ltp: 1680, type: 'Interim' },
  { symbol: 'ITC', name: 'ITC Ltd', exDate: '2026-05-08', recordDate: '2026-05-09', dividendAmount: 6.75, dividendYield: 3.2, ltp: 445, type: 'Final' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', exDate: '2026-05-25', recordDate: '2026-05-26', dividendAmount: 15, dividendYield: 5.8, ltp: 385, type: 'Special' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exDate: '2026-05-18', recordDate: '2026-05-19', dividendAmount: 22, dividendYield: 1.5, ltp: 2560, type: 'Final' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', exDate: '2026-05-22', recordDate: '2026-05-23', dividendAmount: 5.75, dividendYield: 4.1, ltp: 242, type: 'Interim' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp of India', exDate: '2026-05-10', recordDate: '2026-05-11', dividendAmount: 4.5, dividendYield: 3.8, ltp: 310, type: 'Final' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp', exDate: '2026-06-02', recordDate: '2026-06-03', dividendAmount: 10, dividendYield: 3.5, ltp: 580, type: 'Final' },
  { symbol: 'VEDL', name: 'Vedanta Ltd', exDate: '2026-06-05', recordDate: '2026-06-06', dividendAmount: 11, dividendYield: 6.2, ltp: 410, type: 'Interim' },
];

type SortField = 'exDate' | 'dividendYield' | 'dividendAmount';
type ViewMode = 'upcoming' | 'highYield';

export default function DividendsPage() {
  const [view, setView] = useState<ViewMode>('upcoming');
  const [sortField, setSortField] = useState<SortField>('exDate');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'exDate');
    }
  };

  const sorted = [...MOCK_DIVIDENDS].sort((a, b) => {
    if (sortField === 'exDate') {
      return sortAsc ? a.exDate.localeCompare(b.exDate) : b.exDate.localeCompare(a.exDate);
    }
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  const displayed = view === 'highYield'
    ? [...sorted].sort((a, b) => b.dividendYield - a.dividendYield)
    : sorted;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Dividends Calendar</h1>
          <p className="text-sm text-zinc-500">Track upcoming corporate actions and high-yield dividend stocks</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {([['upcoming', 'Upcoming Ex-Dates'], ['highYield', 'High Yield']] as [ViewMode, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setView(key)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === key ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Company</th>
                <th>Type</th>
                <th onClick={() => handleSort('exDate')} className="cursor-pointer hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-1">Ex-Date <ArrowUpDown className="w-3 h-3 text-zinc-600" /></div>
                </th>
                <th className="text-right" onClick={() => handleSort('dividendAmount')} >
                  <div className="flex items-center justify-end gap-1 cursor-pointer hover:bg-white/[0.02]">Dividend/Share <ArrowUpDown className="w-3 h-3 text-zinc-600" /></div>
                </th>
                <th className="text-right" onClick={() => handleSort('dividendYield')}>
                  <div className="flex items-center justify-end gap-1 cursor-pointer hover:bg-white/[0.02]">Yield <ArrowUpDown className="w-3 h-3 text-zinc-600" /></div>
                </th>
                <th className="text-right">LTP</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(d => (
                <tr key={d.symbol}>
                  <td>
                    <Link href={`/dashboard/stock/${d.symbol}`} className="font-bold text-white hover:text-cyan-400 transition-colors">
                      {d.symbol}
                    </Link>
                    <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">{d.name}</div>
                  </td>
                  <td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      d.type === 'Special' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                      d.type === 'Interim' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="text-zinc-300 font-medium">{d.exDate}</td>
                  <td className="text-right font-mono font-bold text-emerald-400">₹{d.dividendAmount}</td>
                  <td className="text-right">
                    <span className={`font-mono font-bold ${d.dividendYield >= 3 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {d.dividendYield.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right font-mono text-zinc-300">{formatCurrency(d.ltp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
