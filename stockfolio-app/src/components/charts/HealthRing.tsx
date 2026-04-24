'use client';

import { motion } from 'framer-motion';

interface HealthRingProps {
  score: number;
  size?: number;
}

export default function HealthRing({ score, size = 120 }: HealthRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#34d399';
    if (s >= 40) return '#fbbf24';
    return '#f87171';
  };

  const getLabel = (s: number) => {
    if (s >= 70) return 'Healthy';
    if (s >= 40) return 'Moderate';
    return 'At Risk';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>

      {/* Center text */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-black font-mono-num"
          style={{ color: getColor(score) }}
        >
          {score}
        </motion.div>
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          {getLabel(score)}
        </div>
      </div>
    </div>
  );
}
