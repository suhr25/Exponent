'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { getMockStockDetail } from '@/lib/utils/mock-data';
import { formatCurrency, formatCurrencyCompact, formatPercent } from '@/lib/utils/formatters';
import { usePaperTradeStore } from '@/lib/store/usePaperTradeStore';

interface CrashScenario {
  name: string;
  year: string;
  drop: number; // percentage drop (negative)
  description: string;
  duration: string;
  recovery: string;
}

const CRASH_SCENARIOS: CrashScenario[] = [
  { name: 'COVID-19 Crash', year: '2020', drop: -38, description: 'Global pandemic triggered fastest bear market in history. Nifty fell from 12,430 to 7,610.', duration: '33 days', recovery: '~5 months' },
  { name: '2008 Financial Crisis', year: '2008', drop: -60, description: 'Subprime mortgage crisis. Sensex crashed from 21,206 to 8,160 over 12 months.', duration: '12 months', recovery: '~3 years' },
  { name: 'Dot-com Bubble', year: '2000', drop: -55, description: 'Tech bubble burst. IT stocks lost 70-90% of their value.', duration: '18 months', recovery: '~5 years' },
  { name: 'Demonetization Shock', year: '2016', drop: -8, description: 'Sudden 500/1000 note ban caused short-term market panic.', duration: '3 weeks', recovery: '~2 months' },
  { name: 'IL&FS / NBFC Crisis', year: '2018', drop: -18, description: 'Credit squeeze following IL&FS default. Small/mid-caps hammered.', duration: '6 months', recovery: '~12 months' },
  { name: 'Hypothetical -25%', year: 'Custom', drop: -25, description: 'Custom stress test: What if the market drops 25% from here?', duration: 'N/A', recovery: 'N/A' },
];

export default function CrashSimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<CrashScenario | null>(null);
  const { holdings } = usePaperTradeStore();
  const { stocks } = useStocksStore();

  // Build a portfolio to stress-test (either from paper trade or a mock one)
  const portfolio = useMemo(() => {
    if (holdings.length > 0) {
      return holdings.map(h => {
        const detail = getMockStockDetail(h.symbol);
        return {
          symbol: h.symbol,
          name: detail.companyName,
          qty: h.quantity,
          avgPrice: h.avgPrice,
          currentPrice: detail.ltp,
          invested: h.avgPrice * h.quantity,
          currentValue: detail.ltp * h.quantity,
          sector: detail.sector || 'Unknown',
        };
      });
    }
    // Mock portfolio if none
    const mockSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'];
    return mockSymbols.map(sym => {
      const detail = getMockStockDetail(sym);
      const qty = Math.floor(Math.random() * 50) + 10;
      return {
        symbol: sym,
        name: detail.companyName,
        qty,
        avgPrice: detail.ltp * 0.95,
        currentPrice: detail.ltp,
        invested: detail.ltp * 0.95 * qty,
        currentValue: detail.ltp * qty,
        sector: detail.sector || 'Unknown',
      };
    });
  }, [holdings, stocks]);

  const totalCurrentValue = portfolio.reduce((s, p) => s + p.currentValue, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Crash Simulator</h1>
          <p className="text-sm text-zinc-500">Stress test your portfolio against historical market crash scenarios</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="text-sm text-zinc-400">
          <span className="text-white font-semibold">Current Portfolio Value:</span>{' '}
          <span className="text-xl font-bold text-white">{formatCurrencyCompact(totalCurrentValue)}</span>
          <span className="text-zinc-600 ml-2">({portfolio.length} positions)</span>
        </div>
      </div>

      {/* Scenario Selection */}
      <h2 className="text-lg font-bold text-white">Select a Crash Scenario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CRASH_SCENARIOS.map((scenario) => {
          const impactValue = totalCurrentValue * (scenario.drop / 100);
          const isSelected = selectedScenario?.name === scenario.name;
          return (
            <motion.button
              key={scenario.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedScenario(scenario)}
              className={`text-left glass-card rounded-xl p-5 border transition-all ${isSelected ? 'border-red-500/40 bg-red-500/[0.04]' : 'border-white/[0.04] hover:border-white/10'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{scenario.name}</h3>
                  <span className="text-[10px] text-zinc-600 font-semibold">{scenario.year}</span>
                </div>
                <div className="text-2xl font-black text-red-400">{scenario.drop}%</div>
              </div>
              <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{scenario.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                <span>Duration: <span className="text-zinc-400">{scenario.duration}</span></span>
                <span>Recovery: <span className="text-zinc-400">{scenario.recovery}</span></span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.04]">
                <div className="text-xs text-zinc-500">Portfolio Impact</div>
                <div className="text-lg font-bold text-red-400">{formatCurrencyCompact(impactValue)}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detailed Impact */}
      {selectedScenario && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] bg-red-500/[0.03]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold text-white">Impact: {selectedScenario.name} ({selectedScenario.drop}%)</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="text-right">Current Value</th>
                  <th className="text-right">After Crash</th>
                  <th className="text-right">Loss</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(p => {
                  const afterCrash = p.currentValue * (1 + selectedScenario.drop / 100);
                  const loss = afterCrash - p.currentValue;
                  return (
                    <tr key={p.symbol}>
                      <td>
                        <span className="font-bold text-white">{p.symbol}</span>
                        <div className="text-[11px] text-zinc-500">{p.qty} qty</div>
                      </td>
                      <td className="text-right font-mono text-zinc-300">{formatCurrency(p.currentValue)}</td>
                      <td className="text-right font-mono text-red-400">{formatCurrency(afterCrash)}</td>
                      <td className="text-right font-mono text-red-400 font-bold">{formatCurrency(loss)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-red-500/[0.05] font-bold">
                  <td className="text-white">TOTAL</td>
                  <td className="text-right font-mono text-white">{formatCurrency(totalCurrentValue)}</td>
                  <td className="text-right font-mono text-red-400">{formatCurrency(totalCurrentValue * (1 + selectedScenario.drop / 100))}</td>
                  <td className="text-right font-mono text-red-400">{formatCurrency(totalCurrentValue * (selectedScenario.drop / 100))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
