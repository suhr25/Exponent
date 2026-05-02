'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { getMockStockDetail } from '@/lib/utils/mock-data';
import { formatPercent } from '@/lib/utils/formatters';

export default function HeatmapPage() {
  const { stocks } = useStocksStore();

  const sectorGroups = useMemo(() => {
    const allDetailed = stocks.map(s => getMockStockDetail(s.sym));
    // Deduplicate by symbol so keys are unique
    const seen = new Set<string>();
    const detailedStocks = allDetailed.filter(s => {
      const sym = s.symbol ?? '';
      if (seen.has(sym)) return false;
      seen.add(sym);
      return true;
    });
    const groups: Record<string, typeof detailedStocks> = {};
    detailedStocks.forEach(s => {
      const sector = s.sector || 'Unknown';
      if (!groups[sector]) groups[sector] = [];
      groups[sector].push(s);
    });
    
    // Sort sectors by total market cap (mocked roughly by sum of LTPs or just number of stocks for simplicity)
    const sortedSectors = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    
    // Sort stocks within sector by changePercent
    sortedSectors.forEach(([_, group]) => {
      group.sort((a, b) => b.changePercent - a.changePercent);
    });

    return sortedSectors;
  }, [stocks]);

  const getColor = (change: number) => {
    if (change >= 3) return 'bg-[#10b981] text-white'; // Strong Green
    if (change > 0) return 'bg-[#059669] text-white'; // Muted Green
    if (change === 0) return 'bg-zinc-700 text-zinc-300'; // Neutral
    if (change > -3) return 'bg-[#dc2626] text-white'; // Muted Red
    return 'bg-[#ef4444] text-white'; // Strong Red
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Market Heatmap</h1>
          <p className="text-sm text-zinc-500">Visual representation of market performance by sector</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6 text-xs text-zinc-400">
          <span>Legend:</span>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#10b981] rounded-sm"/> ≥ +3%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#059669] rounded-sm"/> &gt; 0%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-zinc-700 rounded-sm"/> 0%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#dc2626] rounded-sm"/> &lt; 0%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ef4444] rounded-sm"/> ≤ -3%</div>
        </div>

        <div className="space-y-8">
          {sectorGroups.map(([sector, sectorStocks]) => (
            <div key={sector}>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">{sector} <span className="text-zinc-500 font-normal">({sectorStocks.length})</span></h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {sectorStocks.map(stock => (
                  <Link 
                    href={`/dashboard/stock/${stock.symbol}`} 
                    key={stock.symbol}
                    className={`block aspect-square rounded-lg p-3 transition-transform hover:scale-105 shadow-lg flex flex-col items-center justify-center text-center ${getColor(stock.changePercent)}`}
                  >
                    <div className="font-bold text-sm tracking-tight mb-1">{stock.symbol}</div>
                    <div className="text-xs opacity-90 font-mono">
                      {stock.changePercent > 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
