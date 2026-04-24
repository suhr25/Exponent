'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SectorDonutProps {
  data: { sector: string; value: number; percentage: number; color: string }[];
}

export default function SectorDonut({ data }: SectorDonutProps) {
  if (!data.length) return null;

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            nameKey="sector"
            paddingAngle={2}
            animationDuration={1200}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(10,10,18,0.95)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: 12,
            }}
            formatter={(value: any, name: any) => [
              `₹${Number(value).toLocaleString('en-IN')} (${data.find(d => d.sector === name)?.percentage.toFixed(1)}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
