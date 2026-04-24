'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, IndianRupee, BarChart3, Activity, Plus,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/usePortfolioStore';
import { useMarketStore } from '@/lib/store/useMarketStore';
import { formatCurrency, formatPercent, formatCurrencyCompact, getChangeColor, getChangeBg } from '@/lib/utils/formatters';
import { generatePortfolioHistory } from '@/lib/utils/analysis';
import { SkeletonStats, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import dynamic from 'next/dynamic';

const PortfolioChart = dynamic(() => import('@/components/charts/PortfolioChart'), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  const { holdings, isLoading, fetchHoldings, totalInvested, currentValue, totalPnl, totalPnlPercent } = usePortfolioStore();
  const { indices, fetchMarketData } = useMarketStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHoldings();
    fetchMarketData();
  }, [fetchHoldings, fetchMarketData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHoldings();
    await fetchMarketData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const invested = totalInvested();
  const value = currentValue();
  const pnl = totalPnl();
  const pnlPct = totalPnlPercent();
  const dayChange = holdings.reduce((s, h) => s + (h.change * h.quantity), 0);
  const dayChangePct = value > 0 ? (dayChange / value) * 100 : 0;

  const chartData = invested > 0 ? generatePortfolioHistory(invested) : [];

  const mockIndices = [
    { name: 'NIFTY 50', value: 24356.75, change: 234.50, changePercent: 0.97, status: 'up' as const },
    { name: 'SENSEX', value: 80234.80, change: 756.30, changePercent: 0.95, status: 'up' as const },
    { name: 'BANK NIFTY', value: 52890.25, change: -123.45, changePercent: -0.23, status: 'down' as const },
    { name: 'NIFTY IT', value: 34567.90, change: 456.78, changePercent: 1.34, status: 'up' as const },
  ];

  const displayIndices = indices.length > 0 ? indices : mockIndices;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <SkeletonChart />
        <SkeletonTable />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Investment',
      value: formatCurrencyCompact(invested),
      icon: IndianRupee,
      accent: '#22d3ee',
      accentLight: 'rgba(34, 211, 238, 0.08)',
    },
    {
      label: 'Current Value',
      value: formatCurrencyCompact(value),
      icon: BarChart3,
      accent: '#34d399',
      accentLight: 'rgba(52, 211, 153, 0.08)',
    },
    {
      label: 'Total P&L',
      value: invested > 0 ? formatCurrency(pnl) : '₹0',
      change: invested > 0 ? formatPercent(pnlPct) : undefined,
      icon: pnl >= 0 ? TrendingUp : TrendingDown,
      accent: pnl >= 0 ? '#34d399' : '#f87171',
      accentLight: pnl >= 0 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)',
    },
    {
      label: 'Day Change',
      value: invested > 0 ? formatCurrency(dayChange) : '₹0',
      change: invested > 0 ? formatPercent(dayChangePct) : undefined,
      icon: Activity,
      accent: dayChange >= 0 ? '#34d399' : '#f87171',
      accentLight: dayChange >= 0 ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your investments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-xs font-semibold text-zinc-400 hover:text-white transition-all hover:bg-white/[0.03] border border-white/[0.04]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Market Indices */}
      <motion.div variants={item} className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {displayIndices.map((idx) => (
          <div key={idx.name} className="glass-card rounded-xl p-4 min-w-[160px] flex-shrink-0">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">{idx.name}</div>
            <div className="text-base font-bold font-mono-num text-zinc-100">{idx.value.toLocaleString('en-IN')}</div>
            <div className={`text-[11px] font-bold font-mono-num mt-1 flex items-center gap-1 ${idx.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {idx.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(idx.change).toFixed(2)} ({formatPercent(idx.changePercent)})
            </div>
          </div>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: stat.accentLight }} />
            <div className="relative flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.accentLight }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
              </div>
            </div>
            <div className="relative text-2xl font-extrabold font-mono-num" style={{ color: stat.accent }}>
              {stat.value}
            </div>
            {stat.change && (
              <div className="relative flex items-center gap-1 text-xs font-semibold mt-1.5" style={{ color: stat.accent }}>
                {pnl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Portfolio Chart */}
      {holdings.length > 0 ? (
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-4">Portfolio Performance</h3>
          <PortfolioChart data={chartData} />
        </motion.div>
      ) : (
        <motion.div variants={item} className="glass-card rounded-xl">
          <EmptyState
            icon={<TrendingUp className="w-7 h-7 text-cyan-400/50" />}
            title="No Holdings Yet"
            description="Add your first stock to see your portfolio performance chart and analytics."
            action={{
              label: 'Add Stock',
              onClick: () => window.location.href = '/dashboard/portfolio',
            }}
          />
        </motion.div>
      )}

      {/* Holdings Table */}
      {holdings.length > 0 && (
        <motion.div variants={item} className="glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.03]">
            <h3 className="text-sm font-bold text-zinc-200">Your Holdings</h3>
            <Link href="/dashboard/portfolio" className="text-[11px] font-bold text-cyan-400/70 hover:text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="text-right">LTP</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">Returns</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 6).map((h) => (
                  <tr key={h.id}>
                    <td>
                      <Link href={`/dashboard/stock/${h.symbol}`} className="hover:text-cyan-400 transition-colors">
                        <div className="font-semibold text-zinc-100">{h.symbol}</div>
                        <div className="text-[11px] text-zinc-600">{h.quantity} shares</div>
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
