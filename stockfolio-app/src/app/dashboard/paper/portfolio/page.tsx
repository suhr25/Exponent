'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowUpDown } from 'lucide-react';
import { usePaperTradeStore } from '@/lib/store/usePaperTradeStore';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils/formatters';

export default function PaperPortfolioPage() {
  const { holdings } = usePaperTradeStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/paper" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Virtual Portfolio</h1>
          <p className="text-sm text-zinc-500 mt-1">Your active paper trading positions</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {holdings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 mb-4">No active positions yet.</p>
            <Link href="/dashboard/screener" className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors">
              Find Stocks to Trade
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th><div className="flex items-center gap-1 cursor-pointer">Symbol <ArrowUpDown className="w-3 h-3 text-zinc-600" /></div></th>
                  <th className="text-right">Product</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Avg Price</th>
                  <th className="text-right">Invested</th>
                  <th className="text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const invested = h.avgPrice * h.quantity;
                  const mockPnl = invested * 0.015; // Mock 1.5% profit
                  const mockPnlPercent = 1.5;
                  
                  return (
                    <tr key={`${h.symbol}-${h.product}`}>
                      <td>
                        <Link href={`/dashboard/stock/${h.symbol}`} className="font-bold text-white hover:text-cyan-400">
                          {h.symbol}
                        </Link>
                      </td>
                      <td className="text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${h.product === 'INTRADAY' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {h.product}
                        </span>
                      </td>
                      <td className="text-right font-mono">{h.quantity}</td>
                      <td className="text-right font-mono">{formatCurrency(h.avgPrice)}</td>
                      <td className="text-right font-mono">{formatCurrency(invested)}</td>
                      <td className="text-right font-mono">
                        <div className={getChangeColor(mockPnl)}>
                          {mockPnl > 0 ? '+' : ''}{formatCurrency(mockPnl)} ({formatPercent(mockPnlPercent)})
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
