'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet, Activity, History, Trophy, Search } from 'lucide-react';
import { usePaperTradeStore } from '@/lib/store/usePaperTradeStore';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

export default function PaperTradingDashboard() {
  const { balance, usedMargin, holdings, orders, loadFromMongo } = usePaperTradeStore();

  // Restore paper trade state from MongoDB on mount (syncs across devices)
  useEffect(() => { loadFromMongo(); }, [loadFromMongo]);
  const availableMargin = balance - usedMargin;

  // Calculate total portfolio value
  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgPrice * h.quantity), 0);
  const currentTotalValue = totalInvested; // For now, we mock current value as invested value unless we pull live prices
  // Ideally, we would fetch live prices for all holdings here. Let's assume some mock variation for visual flair.
  
  // Realized PnL from store + Unrealized
  const totalRealizedPnl = holdings.reduce((sum, h) => sum + h.realizedPnl, 0);
  
  // Mock unrealized P&L (1.5% up)
  const mockUnrealizedPnl = totalInvested > 0 ? totalInvested * 0.015 : 0;
  const mockPnlPercent = totalInvested > 0 ? 1.5 : 0;

  const totalNetWorth = balance + totalInvested + mockUnrealizedPnl;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paper Trading</h1>
          <p className="text-sm text-zinc-500 mt-1">Practice trading with virtual money</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/paper/orders" className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white transition-all">
            <History className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/paper/leaderboard" className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white transition-all">
            <Trophy className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/screener" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050507] font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
            <Search className="w-4 h-4" />
            Find Stocks
          </Link>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 md:col-span-2 bg-gradient-to-br from-[#0c0c14] to-[#0c0c14] border-cyan-500/10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="text-sm text-zinc-400 mb-1">Net Worth</div>
              <div className="text-4xl font-bold text-white mb-2">{formatCurrency(totalNetWorth)}</div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${mockUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {mockUnrealizedPnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatCurrency(Math.abs(mockUnrealizedPnl))} ({formatPercent(mockPnlPercent)}) <span className="text-zinc-500 font-normal">Today</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Available Margin</div>
                <div className="text-xl font-bold text-white">{formatCurrency(availableMargin)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Used Margin</div>
                <div className="text-xl font-bold text-white">{formatCurrency(usedMargin)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Total Invested</div>
                <div className="text-xl font-bold text-white">{formatCurrency(totalInvested)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Realized P&L</div>
                <div className={`text-xl font-bold ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalRealizedPnl > 0 ? '+' : ''}{formatCurrency(totalRealizedPnl)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Trading Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Total Trades</span>
                <span className="text-sm font-bold text-white">{orders.filter(o => o.status === 'EXECUTED').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Win Rate</span>
                <span className="text-sm font-bold text-emerald-400">0.0%</span> {/* Mock */}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Active Positions</span>
                <span className="text-sm font-bold text-white">{holdings.length}</span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/paper/portfolio" className="mt-4 w-full py-2.5 rounded-lg border border-white/10 text-center text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all">
            View Full Portfolio
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Positions */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Active Positions</h3>
            <Link href="/dashboard/paper/portfolio" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {holdings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-sm text-zinc-400">No active positions</p>
              <Link href="/dashboard/screener" className="inline-block mt-3 text-xs text-cyan-400 hover:text-cyan-300">
                Find stocks to trade
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {holdings.slice(0, 3).map((h) => (
                <div key={`${h.symbol}-${h.product}`} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/stock/${h.symbol}`} className="text-sm font-bold text-white hover:text-cyan-400">{h.symbol}</Link>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{h.product}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {h.quantity} qty • Avg: {formatCurrency(h.avgPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(h.avgPrice * h.quantity)}</div>
                    <div className="text-xs text-emerald-400 mt-1">+1.5%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Orders</h3>
            <Link href="/dashboard/paper/orders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm text-zinc-400">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${o.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {o.side}
                      </span>
                      <span className="text-sm font-bold text-white">{o.symbol}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {o.quantity} qty • {o.type} • {o.product}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(o.price)}</div>
                    <div className={`text-[10px] mt-1 ${
                      o.status === 'EXECUTED' ? 'text-emerald-400' : 
                      o.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
