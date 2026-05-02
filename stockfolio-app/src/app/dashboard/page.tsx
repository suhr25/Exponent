'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, IndianRupee, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles,
} from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/usePortfolioStore';
import { useMarketStore } from '@/lib/store/useMarketStore';
import { formatCurrency, formatPercent, formatCurrencyCompact, getChangeColor, getChangeBg } from '@/lib/utils/formatters';
import { generatePortfolioHistory } from '@/lib/utils/analysis';
import { SkeletonStats, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store/useAuthStore';

const PortfolioChart = dynamic(() => import('@/components/charts/PortfolioChart'), { ssr: false });

const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const MOCK_INDICES = [
  { name: 'NIFTY 50',     value: 24356.75, change:  234.50, changePercent:  0.97 },
  { name: 'SENSEX',       value: 80234.80, change:  756.30, changePercent:  0.95 },
  { name: 'BANK NIFTY',   value: 52890.25, change: -123.45, changePercent: -0.23 },
  { name: 'NIFTY IT',     value: 34567.90, change:  456.78, changePercent:  1.34 },
  { name: 'NIFTY MIDCAP', value: 51234.60, change:  312.40, changePercent:  0.61 },
];

export default function DashboardPage() {
  const { holdings, isLoading, fetchHoldings, totalInvested, currentValue, totalPnl, totalPnlPercent } = usePortfolioStore();
  const { indices, fetchMarketData } = useMarketStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHoldings();
    fetchMarketData();
  }, [fetchHoldings, fetchMarketData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHoldings(), fetchMarketData()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  const invested     = totalInvested();
  const value        = currentValue();
  const pnl          = totalPnl();
  const pnlPct       = totalPnlPercent();
  const dayChange    = holdings.reduce((s, h) => s + (h.change * h.quantity), 0);
  const dayChangePct = value > 0 ? (dayChange / value) * 100 : 0;
  const chartData    = invested > 0 ? generatePortfolioHistory(invested) : [];
  const displayIndices = indices.length > 0 ? indices : MOCK_INDICES;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) return (
    <div className="space-y-6"><SkeletonStats /><SkeletonChart /><SkeletonTable /></div>
  );

  const stats = [
    { label: 'Total Investment', value: formatCurrencyCompact(invested),                   icon: IndianRupee,                        accent: '#22d3ee', bg: 'rgba(34,211,238,0.06)',  border: 'rgba(34,211,238,0.11)'  },
    { label: 'Current Value',    value: formatCurrencyCompact(value),                      icon: BarChart3,                          accent: '#34d399', bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.11)'  },
    { label: 'Total P&L',        value: invested > 0 ? formatCurrency(pnl) : '₹0',        change: invested > 0 ? formatPercent(pnlPct) : undefined,      up: pnl >= 0,      icon: pnl >= 0 ? TrendingUp : TrendingDown,      accent: pnl >= 0 ? '#34d399' : '#f87171', bg: pnl >= 0 ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)', border: pnl >= 0 ? 'rgba(52,211,153,0.11)' : 'rgba(248,113,113,0.11)' },
    { label: 'Day Change',       value: invested > 0 ? formatCurrency(dayChange) : '₹0',  change: invested > 0 ? formatPercent(dayChangePct) : undefined,  up: dayChange >= 0, icon: Activity, accent: dayChange >= 0 ? '#34d399' : '#f87171', bg: dayChange >= 0 ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)', border: dayChange >= 0 ? 'rgba(52,211,153,0.11)' : 'rgba(248,113,113,0.11)' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Overview of your investments</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-50 active:scale-95 transition-all">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Market Indices */}
      <motion.div variants={fadeUp} className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
        {displayIndices.map((idx, i) => {
          const up = idx.changePercent >= 0;
          return (
            <motion.div key={idx.name}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex-shrink-0 rounded-2xl px-4 py-3.5 min-w-[148px] relative overflow-hidden"
              style={{ background: up ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${up ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)'}` }}
            >
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full blur-xl pointer-events-none"
                style={{ background: up ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }} />
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em] mb-1.5">{idx.name}</div>
              <div className="text-sm font-bold text-white font-mono-num">{idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className={`flex items-center gap-0.5 mt-1 text-[11px] font-bold font-mono-num ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {formatPercent(Math.abs(idx.changePercent))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label}
            className="relative rounded-2xl p-5 overflow-hidden hover:-translate-y-0.5 transition-transform duration-200"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
          >
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full blur-2xl pointer-events-none" style={{ background: s.bg }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.12em]">{s.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.border }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.accent }} />
                </div>
              </div>
              <div className="text-xl font-extrabold font-mono-num" style={{ color: s.accent }}>{s.value}</div>
              {s.change && (
                <div className={`flex items-center gap-0.5 text-[11px] font-semibold font-mono-num mt-1 ${'up' in s && s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {'up' in s && s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Chart */}
      {holdings.length > 0 ? (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-zinc-200">Portfolio Performance</h3>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04]">30D</span>
          </div>
          <PortfolioChart data={chartData} />
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl">
          <EmptyState
            icon={<TrendingUp className="w-7 h-7 text-cyan-400/50" />}
            title="No Holdings Yet"
            description="Add your first stock to start tracking your portfolio performance."
            action={{ label: 'Add Stock', onClick: () => window.location.href = '/dashboard/portfolio' }}
          />
        </motion.div>
      )}

      {/* Holdings Table */}
      {holdings.length > 0 && (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03]">
            <h3 className="text-sm font-bold text-zinc-200">Your Holdings</h3>
            <Link href="/dashboard/portfolio"
              className="text-[11px] font-bold text-cyan-400/70 hover:text-cyan-400 flex items-center gap-1 uppercase tracking-wider transition-colors">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="text-right">LTP</th>
                  <th className="text-right">P&amp;L</th>
                  <th className="text-right">Returns</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 6).map(h => (
                  <tr key={h.id}>
                    <td>
                      <Link href={`/dashboard/stock/${h.symbol}`} className="group">
                        <div className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">{h.symbol}</div>
                        <div className="text-[11px] text-zinc-600">{h.quantity} shares · avg {formatCurrency(h.buy_price)}</div>
                      </Link>
                    </td>
                    <td className="text-right font-semibold font-mono-num text-zinc-200">{formatCurrency(h.ltp)}</td>
                    <td className={`text-right font-semibold font-mono-num ${getChangeColor(h.pnl)}`}>
                      {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                    </td>
                    <td className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono-num ${getChangeBg(h.pnlPercent)}`}>
                        {formatPercent(h.pnlPercent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
