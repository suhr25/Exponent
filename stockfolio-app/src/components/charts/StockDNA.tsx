'use client';

import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { StockDNAScores } from '@/lib/utils/technicals';

const AXIS_DESCRIPTIONS: Record<string, string> = {
  Momentum: 'RSI + MACD signal strength — how strong is the price trend',
  Fundamentals: 'ROE, P/E, Debt/Equity — core financial health',
  Value: 'P/B, P/E vs sector — is the stock cheap or expensive',
  Growth: 'Revenue & EPS growth trajectory over time',
  Volatility: 'Price stability — higher score = less volatile (safer)',
  Sentiment: 'News and market sentiment analysis score',
};

interface Props {
  scores: StockDNAScores;
  strengths?: string[];
  weaknesses?: string[];
}

export default function StockDNA({ scores, strengths, weaknesses }: Props) {
  const data = [
    { axis: 'Momentum', value: Math.round(scores.momentum), fullMark: 100 },
    { axis: 'Fundamentals', value: Math.round(scores.fundamentals), fullMark: 100 },
    { axis: 'Value', value: Math.round(scores.value), fullMark: 100 },
    { axis: 'Growth', value: Math.round(scores.growth), fullMark: 100 },
    { axis: 'Volatility', value: Math.round(scores.volatility), fullMark: 100 },
    { axis: 'Sentiment', value: Math.round(scores.sentiment), fullMark: 100 },
  ];

  const overallScore = Math.round(
    (scores.momentum + scores.fundamentals + scores.value + scores.growth + scores.volatility + scores.sentiment) / 6
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Stock DNA</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Multi-factor analysis score</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono tabular-nums" style={{
            color: overallScore > 65 ? '#34d399' : overallScore > 40 ? '#fbbf24' : '#f87171'
          }}>
            {overallScore}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Overall</div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload[0]) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-[#0e0e18] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                    <div className="text-xs font-bold text-white">{item.axis}: {item.value}/100</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 max-w-[180px]">
                      {AXIS_DESCRIPTIONS[item.axis]}
                    </div>
                  </div>
                );
              }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#00d4aa"
              fill="#00d4aa"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4, fill: '#00d4aa', strokeWidth: 0 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths & Weaknesses */}
      {(strengths || weaknesses) && (
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.04]">
          {strengths && strengths.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4>
              <ul className="space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weaknesses && weaknesses.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Weaknesses</h4>
              <ul className="space-y-1">
                {weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">✗</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
