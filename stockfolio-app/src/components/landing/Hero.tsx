'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Zap, Shield, BarChart3, Brain, Globe2 } from 'lucide-react';

const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false });
const ParticleField = dynamic(() => import('@/components/three/ParticleField'), { ssr: false });

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 2500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── Hero Section ─────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Deep mesh gradient background */}
      <div className="absolute inset-0 hero-gradient" />

      {/* 3D Particles - behind everything */}
      <div className="absolute inset-0 z-[1]">
        <Scene>
          <ambientLight intensity={0.2} />
          <ParticleField />
        </Scene>
      </div>

      {/* Dark vignette for text readability — strong center obscure */}
      <div className="absolute inset-0 z-[2]" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(5,5,7,0.7) 0%, rgba(5,5,7,0.4) 40%, rgba(5,5,7,0.9) 100%)'
      }} />

      {/* Top fade */}
      <div className="absolute top-0 inset-x-0 h-48 z-[2] bg-gradient-to-b from-[#050507] via-[#050507]/80 to-transparent" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-56 z-[2] bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">
              Live NSE · BSE Market Data
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95] tracking-tight mb-8 hero-text-shadow"
          >
            <span className="text-white/95">Master the</span>
            <br />
            <span className="gradient-text animate-gradient">Indian Markets</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed hero-subtitle-shadow"
          >
            AI-powered portfolio intelligence, professional-grade screeners, 
            real-time charting, and market insights {' '}
            <span className="text-zinc-200 font-medium">built for serious Indian investors.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2.5 px-8 py-4 text-base rounded-2xl btn-primary-glow"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl glass text-zinc-200 hover:text-white hover:bg-white/[0.04] transition-all border border-white/[0.06]"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Explore Dashboard
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-6 max-w-md mx-auto"
          >
            {[
              { value: 10000, suffix: '+', label: 'Active Users' },
              { value: 500, prefix: '₹', suffix: ' Cr', label: 'Assets Tracked' },
              { value: 99, suffix: '.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono-num">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-500 mt-1.5 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border border-zinc-700/60 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-cyan-400/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Live Market Data',
    description: 'Real-time NSE & BSE prices, indices, and volume data streaming to your dashboard.',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'rgba(34, 211, 238, 0.1)',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Portfolio health scoring, risk analysis, and AI-generated stock explanations in plain English.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(52, 211, 153, 0.1)',
  },
  {
    icon: Shield,
    title: 'Smart Screener',
    description: 'Filter by PE, ROCE, RSI, market cap, sector — 20+ professional-grade parameters.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(167, 139, 250, 0.1)',
  },
  {
    icon: BarChart3,
    title: 'Pro Charts',
    description: 'TradingView-powered candlestick charts with volume, multi-timeframe analysis.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(251, 191, 36, 0.1)',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Set price targets and get notified instantly when stocks hit your levels.',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.1)',
  },
  {
    icon: Globe2,
    title: 'Portfolio Sync',
    description: 'Connect your Groww account to auto-import holdings and track P&L in real-time.',
    gradient: 'from-indigo-500 to-blue-600',
    glow: 'rgba(99, 102, 241, 0.1)',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28 mesh-gradient">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-dots" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400/80 mb-4 block">
            Why Exponent
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Everything to{' '}
            <span className="gradient-text">Invest Smarter</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-base leading-relaxed">
            Professional-grade tools that were once only available to institutional players.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-7 group relative"
            >
              {/* Ambient glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${feature.glow}, transparent 70%)` }}
              />

              <div className="relative">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Market Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-card rounded-2xl p-6 overflow-hidden"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
              Live Market Feed
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[
              { name: 'NIFTY 50', value: '24,356.75', change: '+0.97%', up: true },
              { name: 'SENSEX', value: '80,234.80', change: '+0.95%', up: true },
              { name: 'BANK NIFTY', value: '52,890.25', change: '-0.23%', up: false },
              { name: 'RELIANCE', value: '₹2,876.45', change: '+2.40%', up: true },
              { name: 'TCS', value: '₹3,842.90', change: '+0.60%', up: true },
              { name: 'HDFC BANK', value: '₹1,678.30', change: '+0.47%', up: true },
              { name: 'INFOSYS', value: '₹1,567.85', change: '+0.49%', up: true },
              { name: 'TATA STEEL', value: '₹145.60', change: '+6.15%', up: true },
            ].map((item) => (
              <div
                key={item.name}
                className="flex-shrink-0 flex items-center gap-4 px-5 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.08] transition-colors"
              >
                <div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.name}</div>
                  <div className="text-sm font-bold text-white font-mono-num mt-0.5">{item.value}</div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg font-mono-num ${
                  item.up
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                    : 'bg-red-500/10 text-red-400 border border-red-500/10'
                }`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
