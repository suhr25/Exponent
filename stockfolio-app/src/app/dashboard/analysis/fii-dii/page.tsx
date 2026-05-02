'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrencyCompact } from '@/lib/utils/formatters';

interface FlowData {
  date: string;
  fiiNet: number; // in Cr
  diiNet: number;
}

const MOCK_DAILY_FLOWS: FlowData[] = [
  { date: '01 May', fiiNet: -2340, diiNet: 3120 },
  { date: '30 Apr', fiiNet: 1560, diiNet: -890 },
  { date: '29 Apr', fiiNet: -4210, diiNet: 5100 },
  { date: '28 Apr', fiiNet: -1890, diiNet: 2340 },
  { date: '25 Apr', fiiNet: 980, diiNet: -560 },
  { date: '24 Apr', fiiNet: -3450, diiNet: 4200 },
  { date: '23 Apr', fiiNet: 2100, diiNet: -1200 },
  { date: '22 Apr', fiiNet: -5600, diiNet: 6100 },
  { date: '21 Apr', fiiNet: -780, diiNet: 1450 },
  { date: '18 Apr', fiiNet: 3200, diiNet: -2100 },
  { date: '17 Apr', fiiNet: -1200, diiNet: 1800 },
  { date: '16 Apr', fiiNet: -2800, diiNet: 3400 },
  { date: '15 Apr', fiiNet: 450, diiNet: -200 },
  { date: '14 Apr', fiiNet: -6100, diiNet: 5800 },
  { date: '11 Apr', fiiNet: 1900, diiNet: -1100 },
];

const MONTHLY_SUMMARY = [
  { month: 'May 2026', fii: -2340, dii: 3120 },
  { month: 'Apr 2026', fii: -18500, dii: 22100 },
  { month: 'Mar 2026', fii: -12800, dii: 15600 },
  { month: 'Feb 2026', fii: 5200, dii: -3100 },
  { month: 'Jan 2026', fii: -28400, dii: 31200 },
  { month: 'Dec 2025', fii: -15600, dii: 18900 },
];

type Tab = 'daily' | 'monthly';

export default function FIIDIIPage() {
  const [tab, setTab] = useState<Tab>('daily');

  const totalFII = MOCK_DAILY_FLOWS.reduce((s, d) => s + d.fiiNet, 0);
  const totalDII = MOCK_DAILY_FLOWS.reduce((s, d) => s + d.diiNet, 0);

  const maxBar = Math.max(...MOCK_DAILY_FLOWS.map(d => Math.max(Math.abs(d.fiiNet), Math.abs(d.diiNet))));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">FII / DII Flow</h1>
          <p className="text-sm text-zinc-500">Track institutional cash flows and market participation</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">FII Net (MTD)</div>
            {totalFII >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
          </div>
          <div className={`text-3xl font-bold ${totalFII >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrencyCompact(totalFII * 1e7)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">Foreign Institutional Investors — Net buying/selling in cash segment</p>
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">DII Net (MTD)</div>
            {totalDII >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
          </div>
          <div className={`text-3xl font-bold ${totalDII >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrencyCompact(totalDII * 1e7)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">Domestic Institutional Investors — Mutual funds, insurance, banks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {(['daily', 'monthly'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'daily' ? (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-right">FII Net (₹ Cr)</th>
                  <th className="w-[300px]"></th>
                  <th className="text-right">DII Net (₹ Cr)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DAILY_FLOWS.map((d) => (
                  <tr key={d.date}>
                    <td className="text-zinc-300 font-medium">{d.date}</td>
                    <td className="text-right">
                      <div className={`font-mono font-bold ${d.fiiNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {d.fiiNet >= 0 ? '+' : ''}{d.fiiNet.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 h-6">
                        {/* FII bar (left) */}
                        <div className="flex-1 flex justify-end">
                          <div
                            className={`h-4 rounded-l ${d.fiiNet >= 0 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                            style={{ width: `${(Math.abs(d.fiiNet) / maxBar) * 100}%` }}
                          />
                        </div>
                        <div className="w-px h-6 bg-zinc-700 flex-shrink-0" />
                        {/* DII bar (right) */}
                        <div className="flex-1">
                          <div
                            className={`h-4 rounded-r ${d.diiNet >= 0 ? 'bg-cyan-500/60' : 'bg-orange-500/60'}`}
                            style={{ width: `${(Math.abs(d.diiNet) / maxBar) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className={`font-mono font-bold ${d.diiNet >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                        {d.diiNet >= 0 ? '+' : ''}{d.diiNet.toLocaleString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-right">FII Net (₹ Cr)</th>
                  <th className="text-right">DII Net (₹ Cr)</th>
                  <th className="text-right">Net Flow</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_SUMMARY.map(m => {
                  const net = m.fii + m.dii;
                  return (
                    <tr key={m.month}>
                      <td className="text-zinc-300 font-medium">{m.month}</td>
                      <td className="text-right">
                        <span className={`font-mono font-bold ${m.fii >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.fii >= 0 ? '+' : ''}{m.fii.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={`font-mono font-bold ${m.dii >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}>
                          {m.dii >= 0 ? '+' : ''}{m.dii.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {net >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                          <span className={`font-mono font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {net >= 0 ? '+' : ''}{net.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
