'use client';

import { useState, useEffect } from 'react';
import { getMarketStatusInfo, getISTTime } from '@/lib/utils/marketHours';

export default function MarketStatusBar() {
  const [statusInfo, setStatusInfo] = useState(getMarketStatusInfo());
  const [time, setTime] = useState(getISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusInfo(getMarketStatusInfo());
      setTime(getISTTime());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <span className="relative flex h-2 w-2">
        {statusInfo.status === 'open' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusInfo.dotColor} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusInfo.dotColor}`} />
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
      <span className="text-[10px] text-zinc-600 font-mono tabular-nums">
        {time}
      </span>
    </div>
  );
}
