'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, CheckCircle2, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { getMockStockDetail } from '@/lib/utils/mock-data';
import { formatCurrency, formatMarketCap, formatPercent, getChangeColor } from '@/lib/utils/formatters';
import type { StockDetail } from '@/lib/types/market';

export default function StockBattlePage() {
  const { stocks } = useStocksStore();
  const [stock1Sym, setStock1Sym] = useState<string>('RELIANCE');
  const [stock2Sym, setStock2Sym] = useState<string>('TCS');
  const [isBattling, setIsBattling] = useState(false);
  const [stock1, setStock1] = useState<StockDetail | null>(null);
  const [stock2, setStock2] = useState<StockDetail | null>(null);

  const startBattle = () => {
    if (!stock1Sym || !stock2Sym || stock1Sym === stock2Sym) return;
    setStock1(getMockStockDetail(stock1Sym));
    setStock2(getMockStockDetail(stock2Sym));
    setIsBattling(true);
  };

  const getWinner = (val1: number, val2: number, lowerIsBetter = false) => {
    if (val1 === val2) return 0;
    if (lowerIsBetter) {
      return val1 < val2 ? 1 : 2;
    }
    return val1 > val2 ? 1 : 2;
  };

  const compareRow = (label: string, val1: number, val2: number, formatFn: (n: number) => string, lowerIsBetter = false, info?: string) => {
    const winner = getWinner(val1, val2, lowerIsBetter);
    return (
      <div className="flex items-center py-3 border-b border-white/[0.04]">
        <div className={`flex-1 text-right font-mono text-sm ${winner === 1 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
          {winner === 1 && <CheckCircle2 className="w-3 h-3 inline-block mr-2 text-emerald-400" />}
          {formatFn(val1)}
        </div>
        <div className="w-32 flex justify-center items-center gap-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</span>
          {info && <span title={info} className="cursor-help flex"><Info className="w-3 h-3 text-zinc-700" /></span>}
        </div>
        <div className={`flex-1 text-left font-mono text-sm ${winner === 2 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
          {formatFn(val2)}
          {winner === 2 && <CheckCircle2 className="w-3 h-3 inline-block ml-2 text-emerald-400" />}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4 border border-cyan-500/20">
          <Swords className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Stock Battle</h1>
        <p className="text-sm text-zinc-500">Compare two stocks head-to-head across fundamentals, technicals, and valuation.</p>
      </div>

      {!isBattling ? (
        <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contender 1</label>
              <select 
                value={stock1Sym} 
                onChange={e => setStock1Sym(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              >
                {stocks.map(s => <option key={s.sym} value={s.sym} className="bg-[#0c0c14]">{s.sym} - {s.name}</option>)}
              </select>
            </div>
            
            <div className="flex-none">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black italic shadow-lg shadow-red-500/20">
                VS
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contender 2</label>
              <select 
                value={stock2Sym} 
                onChange={e => setStock2Sym(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              >
                {stocks.map(s => <option key={s.sym} value={s.sym} className="bg-[#0c0c14]">{s.sym} - {s.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={startBattle}
              disabled={stock1Sym === stock2Sym}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050507] font-bold rounded-xl shadow-[0_0_20px_rgba(0,212,170,0.2)] hover:shadow-[0_0_30px_rgba(0,212,170,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              FIGHT!
            </button>
            {stock1Sym === stock2Sym && <p className="text-xs text-red-400 mt-2">Please select two different stocks.</p>}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {stock1 && stock2 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsBattling(false)} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-sm text-zinc-300 transition-colors">
                  <X className="w-4 h-4" /> New Battle
                </button>
              </div>

              {/* Headers */}
              <div className="flex items-end mb-6">
                <div className="flex-1 text-right pr-4">
                  <h2 className="text-3xl font-black text-white">{stock1.symbol}</h2>
                  <div className="text-sm text-zinc-500 mt-1">{stock1.companyName}</div>
                  <div className="text-2xl font-bold mt-3">{formatCurrency(stock1.ltp)}</div>
                  <div className={`text-sm font-semibold flex justify-end items-center gap-1 ${getChangeColor(stock1.change)}`}>
                    {stock1.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercent(stock1.changePercent)}
                  </div>
                </div>
                <div className="w-32 flex justify-center items-center pb-4">
                  <div className="text-2xl font-black italic text-red-500 opacity-50">VS</div>
                </div>
                <div className="flex-1 text-left pl-4">
                  <h2 className="text-3xl font-black text-white">{stock2.symbol}</h2>
                  <div className="text-sm text-zinc-500 mt-1">{stock2.companyName}</div>
                  <div className="text-2xl font-bold mt-3">{formatCurrency(stock2.ltp)}</div>
                  <div className={`text-sm font-semibold flex items-center gap-1 ${getChangeColor(stock2.change)}`}>
                    {stock2.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatPercent(stock2.changePercent)}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-white/[0.02] py-2 px-4 border-b border-white/[0.06] text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Valuation
                </div>
                <div className="px-6 py-2">
                  {compareRow('P/E Ratio', stock1.pe || 0, stock2.pe || 0, n => n.toFixed(2), true)}
                  {compareRow('P/B Ratio', stock1.pb || 0, stock2.pb || 0, n => n.toFixed(2), true)}
                  {compareRow('Market Cap', stock1.marketCap || 0, stock2.marketCap || 0, n => formatMarketCap(n))}
                  {compareRow('Div Yield', stock1.dividendYield || 0, stock2.dividendYield || 0, n => `${n}%`)}
                </div>

                <div className="bg-white/[0.02] py-2 px-4 border-y border-white/[0.06] text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Fundamentals (TTM)
                </div>
                <div className="px-6 py-2">
                  {compareRow('ROE', stock1.roe, stock2.roe, n => `${n}%`)}
                  {compareRow('ROCE', stock1.roce, stock2.roce, n => `${n}%`)}
                  {compareRow('EPS', stock1.eps, stock2.eps, n => formatCurrency(n))}
                  {compareRow('Debt/Eq', stock1.debtToEquity, stock2.debtToEquity, n => n.toFixed(2), true)}
                </div>
                
                {/* 1 Year Performance mock */}
                <div className="bg-white/[0.02] py-2 px-4 border-y border-white/[0.06] text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Performance
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <div className="text-xs text-zinc-500 mt-2 text-right">1Y Rtn: +18.5%</div>
                    </div>
                    <div className="w-8 text-center text-xs font-bold text-zinc-600">1Y</div>
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
                      </div>
                      <div className="text-xs text-zinc-500 mt-2 text-left">1Y Rtn: +12.1%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
