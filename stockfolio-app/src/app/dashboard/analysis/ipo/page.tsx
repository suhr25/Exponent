'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Clock, CheckCircle2, ArrowUpRight, TrendingUp, Calendar, Users } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/formatters';

interface IPO {
  name: string;
  symbol: string;
  priceRange: string;
  lotSize: number;
  issueSize: number; // in Cr
  openDate: string;
  closeDate: string;
  listingDate: string;
  gmp: number; // Grey Market Premium in ₹
  subscriptionRetail: number;
  subscriptionTotal: number;
  status: 'upcoming' | 'active' | 'listed';
  listingPrice?: number;
  issuePrice?: number;
  category: 'Mainboard' | 'SME';
}

const MOCK_IPOS: IPO[] = [
  {
    name: 'GreenTech Renewables Ltd',
    symbol: 'GREENTECH',
    priceRange: '₹280 - ₹295',
    lotSize: 50,
    issueSize: 1250,
    openDate: '2026-05-08',
    closeDate: '2026-05-12',
    listingDate: '2026-05-15',
    gmp: 85,
    subscriptionRetail: 0,
    subscriptionTotal: 0,
    status: 'upcoming',
    category: 'Mainboard',
  },
  {
    name: 'Digital Bharat Finserv',
    symbol: 'DBFINSERV',
    priceRange: '₹145 - ₹152',
    lotSize: 98,
    issueSize: 820,
    openDate: '2026-05-05',
    closeDate: '2026-05-07',
    listingDate: '2026-05-10',
    gmp: 42,
    subscriptionRetail: 3.2,
    subscriptionTotal: 8.5,
    status: 'active',
    category: 'Mainboard',
  },
  {
    name: 'MediAssist Healthcare',
    symbol: 'MEDIASSIST',
    priceRange: '₹78 - ₹82',
    lotSize: 180,
    issueSize: 350,
    openDate: '2026-05-01',
    closeDate: '2026-05-03',
    listingDate: '2026-05-06',
    gmp: 18,
    subscriptionRetail: 12.8,
    subscriptionTotal: 45.2,
    status: 'active',
    category: 'SME',
  },
  {
    name: 'NextGen EV Motors',
    symbol: 'NEXTGENEV',
    priceRange: '₹520 - ₹548',
    lotSize: 27,
    issueSize: 2100,
    openDate: '2026-04-22',
    closeDate: '2026-04-24',
    listingDate: '2026-04-28',
    gmp: 0,
    subscriptionRetail: 18.5,
    subscriptionTotal: 62.1,
    status: 'listed',
    issuePrice: 548,
    listingPrice: 685,
    category: 'Mainboard',
  },
  {
    name: 'Agritech Solutions India',
    symbol: 'AGRITECH',
    priceRange: '₹210 - ₹222',
    lotSize: 67,
    issueSize: 560,
    openDate: '2026-04-18',
    closeDate: '2026-04-21',
    listingDate: '2026-04-24',
    gmp: 0,
    subscriptionRetail: 5.1,
    subscriptionTotal: 22.8,
    status: 'listed',
    issuePrice: 222,
    listingPrice: 198,
    category: 'Mainboard',
  },
];

type Tab = 'upcoming' | 'active' | 'listed';

export default function IPORadarPage() {
  const [tab, setTab] = useState<Tab>('active');

  const filtered = MOCK_IPOS.filter(i => i.status === tab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'listed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return '';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Landmark className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">IPO Radar</h1>
          <p className="text-sm text-zinc-500">Track upcoming, active, and recently listed IPOs</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', count: MOCK_IPOS.filter(i => i.status === 'upcoming').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active', count: MOCK_IPOS.filter(i => i.status === 'active').length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Recently Listed', count: MOCK_IPOS.filter(i => i.status === 'listed').length, icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{card.count}</div>
                <div className="text-xs text-zinc-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {(['upcoming', 'active', 'listed'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t === 'listed' ? 'Recently Listed' : t}
          </button>
        ))}
      </div>

      {/* IPO Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-zinc-400">No {tab} IPOs at the moment.</p>
          </div>
        ) : (
          filtered.map((ipo) => (
            <motion.div
              key={ipo.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 border border-white/[0.04] hover:border-white/10 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{ipo.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(ipo.status)}`}>
                      {ipo.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-zinc-400 font-semibold">
                      {ipo.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 mt-4">
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Price Band</div>
                      <div className="text-sm font-semibold text-white">{ipo.priceRange}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Issue Size</div>
                      <div className="text-sm font-semibold text-white">{formatCurrencyCompact(ipo.issueSize * 1e7)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Lot Size</div>
                      <div className="text-sm font-semibold text-white">{ipo.lotSize} shares</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Dates</div>
                      <div className="text-sm font-semibold text-white">{ipo.openDate} → {ipo.closeDate}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  {ipo.status !== 'listed' && ipo.gmp > 0 && (
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Grey Market Premium</div>
                      <div className="text-xl font-bold text-emerald-400">+₹{ipo.gmp}</div>
                    </div>
                  )}
                  {ipo.status === 'active' && (
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1 flex items-center gap-1 justify-end"><Users className="w-3 h-3" /> Subscription</div>
                      <div className="text-sm text-white">
                        <span className="font-bold">{ipo.subscriptionTotal}x</span>
                        <span className="text-zinc-500 ml-1">(Retail: {ipo.subscriptionRetail}x)</span>
                      </div>
                    </div>
                  )}
                  {ipo.status === 'listed' && ipo.issuePrice && ipo.listingPrice && (
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1">Listing Performance</div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 line-through">{formatCurrency(ipo.issuePrice)}</span>
                        <ArrowUpRight className={`w-4 h-4 ${ipo.listingPrice >= ipo.issuePrice ? 'text-emerald-400' : 'text-red-400 rotate-90'}`} />
                        <span className={`text-xl font-bold ${ipo.listingPrice >= ipo.issuePrice ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(ipo.listingPrice)}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${ipo.listingPrice >= ipo.issuePrice ? 'text-emerald-400' : 'text-red-400'}`}>
                        {((ipo.listingPrice - ipo.issuePrice) / ipo.issuePrice * 100).toFixed(1)}% listing gain
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
