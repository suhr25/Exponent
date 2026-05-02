'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Flame, Swords, ShieldAlert, Radio, Landmark, BarChart3, 
  CalendarDays, Calculator, ArrowRight 
} from 'lucide-react';

const ANALYSIS_TOOLS = [
  {
    title: 'Market Heatmap',
    description: 'Visual representation of the market grouped by sector and performance.',
    icon: Flame,
    href: '/dashboard/analysis/heatmap',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  {
    title: 'Stock Battle',
    description: 'Head-to-head comparison of two stocks across fundamentals and technicals.',
    icon: Swords,
    href: '/dashboard/analysis/battle',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  },
  {
    title: 'IPO Radar',
    description: 'Track upcoming, active, and recently listed IPOs with GMP data.',
    icon: Landmark,
    href: '/dashboard/analysis/ipo',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    title: 'Options X-Ray',
    description: 'Advanced option chain analysis, PCR, and Max Pain for indices.',
    icon: Radio,
    href: '/dashboard/analysis/options',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
  },
  {
    title: 'Crash Simulator',
    description: 'Stress test your portfolio against historical market crash scenarios.',
    icon: ShieldAlert,
    href: '/dashboard/analysis/stress-test',
    color: 'from-red-500 to-rose-500',
    bg: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  {
    title: 'FII / DII Flow',
    description: 'Track institutional cash flows and market participation trends.',
    icon: BarChart3,
    href: '/dashboard/analysis/fii-dii',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    title: 'Dividends Calendar',
    description: 'Track upcoming corporate actions and high-yield dividend stocks.',
    icon: CalendarDays,
    href: '/dashboard/analysis/dividends',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  },
  {
    title: 'Tax Planner',
    description: 'Estimate your STCG and LTCG taxes under the current Indian tax regime.',
    icon: Calculator,
    href: '/dashboard/analysis/tax',
    color: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
];

export default function AnalysisHubPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Analysis Hub</h1>
        <p className="text-zinc-400 max-w-2xl">
          Advanced tools and market intelligence to power your trading decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ANALYSIS_TOOLS.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-6 h-full border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className={`w-12 h-12 rounded-xl border ${tool.bg} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </h3>
                
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
