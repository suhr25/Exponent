'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info, IndianRupee } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/formatters';
import { usePaperTradeStore } from '@/lib/store/usePaperTradeStore';

// Indian Tax Rates (FY 2025-26)
const STCG_RATE = 0.20; // 20% for listed equity (held < 1 year)
const LTCG_RATE = 0.125; // 12.5% for listed equity (held > 1 year)
const LTCG_EXEMPTION = 125000; // ₹1.25 Lakh exemption per year
const CESS_RATE = 0.04; // 4% Health & Education Cess

interface TaxEntry {
  symbol: string;
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingPeriod: 'short' | 'long';
  profit: number;
}

const MOCK_TAX_ENTRIES: TaxEntry[] = [
  { symbol: 'RELIANCE', buyDate: '2025-03-15', sellDate: '2026-01-20', buyPrice: 2450, sellPrice: 2780, quantity: 20, holdingPeriod: 'short', profit: (2780 - 2450) * 20 },
  { symbol: 'TCS', buyDate: '2024-06-10', sellDate: '2026-02-15', buyPrice: 3200, sellPrice: 3500, quantity: 15, holdingPeriod: 'long', profit: (3500 - 3200) * 15 },
  { symbol: 'INFY', buyDate: '2025-08-01', sellDate: '2026-03-10', buyPrice: 1480, sellPrice: 1380, quantity: 30, holdingPeriod: 'short', profit: (1380 - 1480) * 30 },
  { symbol: 'HDFCBANK', buyDate: '2024-01-20', sellDate: '2025-12-05', buyPrice: 1520, sellPrice: 1720, quantity: 25, holdingPeriod: 'long', profit: (1720 - 1520) * 25 },
  { symbol: 'ICICIBANK', buyDate: '2025-11-01', sellDate: '2026-04-15', buyPrice: 1050, sellPrice: 1180, quantity: 40, holdingPeriod: 'short', profit: (1180 - 1050) * 40 },
];

export default function TaxPlannerPage() {
  const [entries] = useState<TaxEntry[]>(MOCK_TAX_ENTRIES);
  const { holdings } = usePaperTradeStore();

  const calculations = useMemo(() => {
    const stcgProfit = entries.filter(e => e.holdingPeriod === 'short' && e.profit > 0).reduce((s, e) => s + e.profit, 0);
    const stcgLoss = entries.filter(e => e.holdingPeriod === 'short' && e.profit < 0).reduce((s, e) => s + e.profit, 0);
    const ltcgProfit = entries.filter(e => e.holdingPeriod === 'long' && e.profit > 0).reduce((s, e) => s + e.profit, 0);
    const ltcgLoss = entries.filter(e => e.holdingPeriod === 'long' && e.profit < 0).reduce((s, e) => s + e.profit, 0);

    const netSTCG = Math.max(0, stcgProfit + stcgLoss); // Losses can offset gains
    const netLTCG = Math.max(0, ltcgProfit + ltcgLoss);
    const taxableLTCG = Math.max(0, netLTCG - LTCG_EXEMPTION);

    const stcgTax = netSTCG * STCG_RATE;
    const ltcgTax = taxableLTCG * LTCG_RATE;
    const totalTax = stcgTax + ltcgTax;
    const cess = totalTax * CESS_RATE;
    const grandTotal = totalTax + cess;

    return {
      stcgProfit, stcgLoss, ltcgProfit, ltcgLoss,
      netSTCG, netLTCG, taxableLTCG,
      stcgTax, ltcgTax, totalTax, cess, grandTotal,
    };
  }, [entries]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Tax Planner</h1>
          <p className="text-sm text-zinc-500">Estimate your capital gains tax under Indian tax law (FY 2025-26)</p>
        </div>
      </div>

      {/* Tax Regime Info */}
      <div className="glass-card rounded-xl p-5 border border-amber-500/10 bg-amber-500/[0.02]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">Indian Tax Rates (FY 2025-26):</span>{' '}
            STCG (held &lt; 12 months) = <span className="text-white font-bold">20%</span> · 
            LTCG (held &gt; 12 months) = <span className="text-white font-bold">12.5%</span> above ₹1.25L exemption · 
            Health &amp; Education Cess = <span className="text-white font-bold">4%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">Realized Transactions</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Buy Date</th>
                    <th>Sell Date</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Buy Price</th>
                    <th className="text-right">Sell Price</th>
                    <th className="text-right">P&L</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={`${e.symbol}-${idx}`}>
                      <td className="font-bold text-white">{e.symbol}</td>
                      <td className="text-zinc-400 text-xs">{e.buyDate}</td>
                      <td className="text-zinc-400 text-xs">{e.sellDate}</td>
                      <td className="text-right font-mono">{e.quantity}</td>
                      <td className="text-right font-mono text-zinc-300">{formatCurrency(e.buyPrice)}</td>
                      <td className="text-right font-mono text-zinc-300">{formatCurrency(e.sellPrice)}</td>
                      <td className={`text-right font-mono font-bold ${e.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {e.profit >= 0 ? '+' : ''}{formatCurrency(e.profit)}
                      </td>
                      <td>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          e.holdingPeriod === 'short' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {e.holdingPeriod === 'short' ? 'STCG' : 'LTCG'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Tax Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Tax Summary</h2>
          <div className="glass-card rounded-xl p-6 space-y-5">
            <div>
              <div className="text-xs text-zinc-600 uppercase font-bold tracking-wider mb-2">Short-Term Capital Gains</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Gains</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(calculations.stcgProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Losses</span>
                  <span className="text-red-400 font-mono">{formatCurrency(calculations.stcgLoss)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/[0.04] pt-2">
                  <span className="text-white font-semibold">Net STCG</span>
                  <span className="text-white font-mono font-bold">{formatCurrency(calculations.netSTCG)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tax @ 20%</span>
                  <span className="text-amber-400 font-mono font-bold">{formatCurrency(calculations.stcgTax)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-5">
              <div className="text-xs text-zinc-600 uppercase font-bold tracking-wider mb-2">Long-Term Capital Gains</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Gains</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(calculations.ltcgProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Losses</span>
                  <span className="text-red-400 font-mono">{formatCurrency(calculations.ltcgLoss)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Net LTCG</span>
                  <span className="text-white font-mono">{formatCurrency(calculations.netLTCG)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Exemption (₹1.25L)</span>
                  <span className="text-emerald-400 font-mono">-{formatCurrency(Math.min(calculations.netLTCG, LTCG_EXEMPTION))}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/[0.04] pt-2">
                  <span className="text-white font-semibold">Taxable LTCG</span>
                  <span className="text-white font-mono font-bold">{formatCurrency(calculations.taxableLTCG)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tax @ 12.5%</span>
                  <span className="text-amber-400 font-mono font-bold">{formatCurrency(calculations.ltcgTax)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal Tax</span>
                <span className="text-white font-mono">{formatCurrency(calculations.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Cess @ 4%</span>
                <span className="text-white font-mono">{formatCurrency(calculations.cess)}</span>
              </div>
              <div className="flex justify-between text-base border-t border-white/[0.06] pt-3 mt-3">
                <span className="text-white font-bold flex items-center gap-1"><IndianRupee className="w-4 h-4" /> Total Tax Liability</span>
                <span className="text-xl font-black text-amber-400">{formatCurrency(calculations.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
