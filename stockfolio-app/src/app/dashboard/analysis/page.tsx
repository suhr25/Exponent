'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LineChartIcon, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Info, CheckCircle } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store/usePortfolioStore';
import {
  calculatePortfolioScore,
  getTopPerformers,
  getWorstPerformers,
  getPortfolioInsights,
  calculateHHI,
  generatePortfolioHistory,
} from '@/lib/utils/analysis';
import { formatCurrency, formatPercent, formatCurrencyCompact, getChangeColor } from '@/lib/utils/formatters';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonStats, SkeletonChart } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';

const PortfolioChart = dynamic(() => import('@/components/charts/PortfolioChart'), { ssr: false });
const SectorDonut = dynamic(() => import('@/components/charts/SectorDonut'), { ssr: false });
const HealthRing = dynamic(() => import('@/components/charts/HealthRing'), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const insightIcons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  danger: <AlertTriangle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-cyan-400" />,
};

const insightBg = {
  success: 'bg-emerald-500/[0.06] border-emerald-500/10',
  warning: 'bg-amber-500/[0.06] border-amber-500/10',
  danger: 'bg-red-500/[0.06] border-red-500/10',
  info: 'bg-cyan-500/[0.06] border-cyan-500/10',
};

export default function AnalysisPage() {
  const { holdings, isLoading, fetchHoldings, totalInvested, currentValue, sectorAllocation } = usePortfolioStore();

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <SkeletonChart />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="glass-card rounded-xl">
        <EmptyState
          icon={<LineChartIcon className="w-7 h-7 text-cyan-400/50" />}
          title="No Data to Analyze"
          description="Add stocks to your portfolio to see insights, health score, diversification analysis, and performance metrics."
          action={{ label: 'Go to Portfolio', onClick: () => window.location.href = '/dashboard/portfolio' }}
        />
      </div>
    );
  }

  const score = calculatePortfolioScore(holdings);
  const topPerformers = getTopPerformers(holdings);
  const worstPerformers = getWorstPerformers(holdings);
  const insights = getPortfolioInsights(holdings);
  const hhi = calculateHHI(holdings);
  const sectors = sectorAllocation();
  const invested = totalInvested();
  const chartData = generatePortfolioHistory(invested);

  const hhiLabel = hhi < 1500 ? 'Diversified' : hhi < 2500 ? 'Moderate' : 'Concentrated';
  const hhiColor = hhi < 1500 ? 'text-emerald-400' : hhi < 2500 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-extrabold tracking-tight">Analysis</h1>
        <p className="text-sm text-zinc-500 mt-1">Portfolio health, diversification, and insights</p>
      </motion.div>

      {/* Top Row: Health + Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Health Score */}
        <motion.div variants={item} className="glass-card rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-zinc-200 mb-6">Portfolio Health</h3>
          <HealthRing score={score} size={140} />
          <div className="mt-5 text-center">
            <div className="text-xs text-zinc-500">
              Based on diversification, returns, and risk concentration
            </div>
          </div>

          {/* HHI */}
          <div className="mt-5 w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">HHI Index</span>
              <span className={`text-sm font-bold font-mono-num ${hhiColor}`}>
                {Math.round(hhi)} <span className="text-xs font-normal">({hhiLabel})</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div variants={item} className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Portfolio Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${insightBg[insight.type]}`}
              >
                <div className="mt-0.5">{insightIcons[insight.type]}</div>
                <div>
                  <div className="text-sm font-semibold">{insight.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{insight.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div variants={item} className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Portfolio Performance (90 Days)</h3>
        <PortfolioChart data={chartData} />
      </motion.div>

      {/* Sector Allocation + Top/Worst */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sector Donut */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-4">Sector Allocation</h3>
          <SectorDonut data={sectors} />
          <div className="mt-4 space-y-2">
            {sectors.map((s) => (
              <div key={s.sector} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-zinc-400">{s.sector}</span>
                </div>
                <span className="font-bold font-mono-num">{s.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {topPerformers.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{h.symbol}</div>
                    <div className="text-[11px] text-zinc-600">{h.quantity} shares</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono-num">+{formatPercent(h.pnlPercent)}</div>
                  <div className="text-[11px] text-zinc-500 font-mono-num">+{formatCurrency(h.pnl)}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Worst Performers */}
        <motion.div variants={item} className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Worst Performers
          </h3>
          <div className="space-y-3">
            {worstPerformers.map((h, i) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{h.symbol}</div>
                    <div className="text-[11px] text-zinc-600">{h.quantity} shares</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold font-mono-num ${getChangeColor(h.pnlPercent)}`}>
                    {formatPercent(h.pnlPercent)}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono-num">{formatCurrency(h.pnl)}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
