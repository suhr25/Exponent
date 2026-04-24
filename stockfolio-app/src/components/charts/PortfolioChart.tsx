'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioChartProps {
  data: { date: string; value: number; invested: number }[];
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
  if (!data.length) return null;

  const isUp = data[data.length - 1]?.value >= data[0]?.value;
  const color = isUp ? '#34d399' : '#f87171';

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b7280" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#6b7280" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.03)' }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`;
            }}
            interval={Math.floor(data.length / 6)}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
            width={55}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            labelStyle={{ color: '#9ca3af', fontSize: 11, marginBottom: 4 }}
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              name === 'value' ? 'Portfolio Value' : 'Invested'
            ]}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="url(#investedGradient)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
