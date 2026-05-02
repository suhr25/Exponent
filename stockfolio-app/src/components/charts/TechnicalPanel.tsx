'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TechnicalSummary } from '@/lib/utils/technicals';

interface Props {
  data: TechnicalSummary;
}

export default function TechnicalPanel({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Summary Header */}
      <div className="px-6 py-5 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">Technical Analysis</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold" style={{ color: data.overallColor }}>
              {data.overallLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{data.buyCount} Buy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-bold text-red-400">{data.sellCount} Sell</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-500">{data.neutralCount} Neutral</span>
          </div>
        </div>
        {/* Signal bar */}
        <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-zinc-800">
          <div className="bg-emerald-400 transition-all" style={{ width: `${(data.buyCount / data.signals.length) * 100}%` }} />
          <div className="bg-zinc-500 transition-all" style={{ width: `${(data.neutralCount / data.signals.length) * 100}%` }} />
          <div className="bg-red-400 transition-all" style={{ width: `${(data.sellCount / data.signals.length) * 100}%` }} />
        </div>
      </div>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.03]">
        {data.signals.map((signal) => (
          <div key={signal.name} className="bg-[#0c0c14] px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">{signal.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                signal.signal === 'buy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : signal.signal === 'sell'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
              }`}>
                {signal.signal === 'buy' ? '▲ BUY' : signal.signal === 'sell' ? '▼ SELL' : '— NEUTRAL'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mb-1">
              {signal.value}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">{signal.description}</p>
            {/* Strength bar */}
            <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${signal.strength}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: signal.signal === 'buy' ? '#34d399' : signal.signal === 'sell' ? '#f87171' : '#6b7280',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
