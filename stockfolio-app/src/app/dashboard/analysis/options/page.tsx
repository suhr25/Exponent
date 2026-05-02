'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, ChevronDown } from 'lucide-react';
import { formatNumber } from '@/lib/utils/formatters';

interface OptionRow {
  strikePrice: number;
  callOI: number;
  callChangeOI: number;
  callLTP: number;
  callIV: number;
  putOI: number;
  putChangeOI: number;
  putLTP: number;
  putIV: number;
}

function generateOptionChain(spotPrice: number, numStrikes: number): OptionRow[] {
  const baseStrike = Math.round(spotPrice / 50) * 50;
  const strikes: OptionRow[] = [];

  for (let i = -numStrikes; i <= numStrikes; i++) {
    const sp = baseStrike + i * 50;
    const distFromSpot = Math.abs(sp - spotPrice) / spotPrice;
    const isITMCall = sp < spotPrice;
    const isITMPut = sp > spotPrice;

    strikes.push({
      strikePrice: sp,
      callOI: Math.round((isITMCall ? 2000 : 8000 + Math.random() * 12000) * (1 - distFromSpot)),
      callChangeOI: Math.round((Math.random() - 0.4) * 3000),
      callLTP: Math.max(0.05, parseFloat((isITMCall ? (spotPrice - sp) + Math.random() * 50 : Math.random() * 80 * (1 - distFromSpot * 3)).toFixed(2))),
      callIV: parseFloat((12 + distFromSpot * 40 + Math.random() * 5).toFixed(2)),
      putOI: Math.round((isITMPut ? 2000 : 6000 + Math.random() * 10000) * (1 - distFromSpot)),
      putChangeOI: Math.round((Math.random() - 0.4) * 3000),
      putLTP: Math.max(0.05, parseFloat((isITMPut ? (sp - spotPrice) + Math.random() * 50 : Math.random() * 80 * (1 - distFromSpot * 3)).toFixed(2))),
      putIV: parseFloat((12 + distFromSpot * 40 + Math.random() * 5).toFixed(2)),
    });
  }
  return strikes;
}

const INDICES = [
  { name: 'NIFTY 50', spot: 24850, expiry: '08 May 2026' },
  { name: 'BANK NIFTY', spot: 53420, expiry: '07 May 2026' },
  { name: 'FINNIFTY', spot: 23180, expiry: '06 May 2026' },
];

export default function OptionsXRayPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const idx = INDICES[selectedIndex];
  const chain = generateOptionChain(idx.spot, 10);

  const totalCallOI = chain.reduce((s, r) => s + r.callOI, 0);
  const totalPutOI = chain.reduce((s, r) => s + r.putOI, 0);
  const pcr = totalPutOI / totalCallOI;

  // Max Pain = strike with highest combined OI
  const maxPainStrike = chain.reduce((max, r) => (r.callOI + r.putOI) > (max.callOI + max.putOI) ? r : max, chain[0]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Radio className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Options X-Ray</h1>
          <p className="text-sm text-zinc-500">Option chain analysis, PCR, and Max Pain for indices</p>
        </div>
      </div>

      {/* Index Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative">
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3 pr-10 text-white font-semibold focus:outline-none focus:border-violet-500/50"
          >
            {INDICES.map((idx, i) => (
              <option key={idx.name} value={i} className="bg-[#0c0c14]">{idx.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        <div className="text-sm text-zinc-400">
          Spot: <span className="text-white font-bold">{idx.spot.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-sm text-zinc-400">
          Expiry: <span className="text-zinc-300 font-semibold">{idx.expiry}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">PCR (OI)</div>
          <div className={`text-2xl font-bold ${pcr > 1 ? 'text-emerald-400' : pcr < 0.7 ? 'text-red-400' : 'text-amber-400'}`}>
            {pcr.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-600 mt-1">{pcr > 1 ? 'Bullish' : pcr < 0.7 ? 'Bearish' : 'Neutral'}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Max Pain</div>
          <div className="text-2xl font-bold text-violet-400">{maxPainStrike.strikePrice.toLocaleString('en-IN')}</div>
          <div className="text-xs text-zinc-600 mt-1">Highest combined OI strike</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Total Call OI</div>
          <div className="text-2xl font-bold text-cyan-400">{formatNumber(totalCallOI)}</div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Total Put OI</div>
          <div className="text-2xl font-bold text-pink-400">{formatNumber(totalPutOI)}</div>
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th colSpan={4} className="bg-emerald-500/5 text-emerald-400 text-center py-2 text-xs font-bold uppercase tracking-wider">CALLS</th>
                <th className="bg-white/[0.03] text-white text-center py-2 text-xs font-bold uppercase tracking-wider">STRIKE</th>
                <th colSpan={4} className="bg-red-500/5 text-red-400 text-center py-2 text-xs font-bold uppercase tracking-wider">PUTS</th>
              </tr>
              <tr className="border-b border-white/[0.06] text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="py-2 px-3 text-right bg-emerald-500/[0.02]">OI</th>
                <th className="py-2 px-3 text-right bg-emerald-500/[0.02]">Chg OI</th>
                <th className="py-2 px-3 text-right bg-emerald-500/[0.02]">LTP</th>
                <th className="py-2 px-3 text-right bg-emerald-500/[0.02]">IV%</th>
                <th className="py-2 px-3 text-center bg-white/[0.03]"></th>
                <th className="py-2 px-3 text-right bg-red-500/[0.02]">OI</th>
                <th className="py-2 px-3 text-right bg-red-500/[0.02]">Chg OI</th>
                <th className="py-2 px-3 text-right bg-red-500/[0.02]">LTP</th>
                <th className="py-2 px-3 text-right bg-red-500/[0.02]">IV%</th>
              </tr>
            </thead>
            <tbody>
              {chain.map((row) => {
                const isATM = row.strikePrice === Math.round(idx.spot / 50) * 50;
                const isITMCall = row.strikePrice < idx.spot;
                const isITMPut = row.strikePrice > idx.spot;
                return (
                  <tr
                    key={row.strikePrice}
                    className={`border-b border-white/[0.03] ${isATM ? 'bg-yellow-500/[0.05] border-y-yellow-500/20' : ''}`}
                  >
                    <td className={`py-1.5 px-3 text-right font-mono ${isITMCall ? 'bg-emerald-500/[0.04]' : ''}`}>{formatNumber(row.callOI)}</td>
                    <td className={`py-1.5 px-3 text-right font-mono ${row.callChangeOI >= 0 ? 'text-emerald-400' : 'text-red-400'} ${isITMCall ? 'bg-emerald-500/[0.04]' : ''}`}>
                      {row.callChangeOI >= 0 ? '+' : ''}{formatNumber(row.callChangeOI)}
                    </td>
                    <td className={`py-1.5 px-3 text-right font-mono text-zinc-300 ${isITMCall ? 'bg-emerald-500/[0.04]' : ''}`}>{row.callLTP.toFixed(2)}</td>
                    <td className={`py-1.5 px-3 text-right font-mono text-zinc-500 ${isITMCall ? 'bg-emerald-500/[0.04]' : ''}`}>{row.callIV}</td>
                    <td className={`py-1.5 px-3 text-center font-bold text-white bg-white/[0.02] ${isATM ? 'text-yellow-400' : ''}`}>
                      {row.strikePrice.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-1.5 px-3 text-right font-mono ${isITMPut ? 'bg-red-500/[0.04]' : ''}`}>{formatNumber(row.putOI)}</td>
                    <td className={`py-1.5 px-3 text-right font-mono ${row.putChangeOI >= 0 ? 'text-emerald-400' : 'text-red-400'} ${isITMPut ? 'bg-red-500/[0.04]' : ''}`}>
                      {row.putChangeOI >= 0 ? '+' : ''}{formatNumber(row.putChangeOI)}
                    </td>
                    <td className={`py-1.5 px-3 text-right font-mono text-zinc-300 ${isITMPut ? 'bg-red-500/[0.04]' : ''}`}>{row.putLTP.toFixed(2)}</td>
                    <td className={`py-1.5 px-3 text-right font-mono text-zinc-500 ${isITMPut ? 'bg-red-500/[0.04]' : ''}`}>{row.putIV}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
