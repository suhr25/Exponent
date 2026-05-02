'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

const INDICES = [
  { name: 'NIFTY 50',   value: '24,356.75', change: '+0.97%', up: true  },
  { name: 'SENSEX',     value: '80,234.80', change: '+0.95%', up: true  },
  { name: 'BANK NIFTY', value: '52,890.25', change: '-0.23%', up: false },
  { name: 'NIFTY IT',   value: '38,450.60', change: '+1.42%', up: true  },
];

const STOCKS = [
  { sym: 'RELIANCE', val: '₹2,876', chg: '+2.40%', up: true  },
  { sym: 'TCS',      val: '₹3,842', chg: '+0.60%', up: true  },
  { sym: 'HDFC',     val: '₹1,678', chg: '+0.47%', up: true  },
  { sym: 'INFY',     val: '₹1,567', chg: '+0.49%', up: true  },
  { sym: 'ICICI',    val: '₹1,245', chg: '-0.31%', up: false },
  { sym: 'WIPRO',    val: '₹478',   chg: '+1.12%', up: true  },
];

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, error, clearError } = useAuthStore();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    const result = await loginWithEmail(email, password);
    if (!result.error) window.location.href = '/dashboard';
    else setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050507] flex overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">
        {/* Layered animated orbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="orb orb-cyan   w-[700px] h-[700px]" style={{ top: '-20%', left: '-15%' }} />
          <div className="orb orb-violet w-[600px] h-[600px]" style={{ top: '35%',  right: '-20%' }} />
          <div className="orb orb-emerald w-[500px] h-[500px]" style={{ bottom: '-15%', left: '25%' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid opacity-40" />
          {/* Dark vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 40% 50%, rgba(5,5,7,0.3) 0%, rgba(5,5,7,0.7) 100%)'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-[#050507]" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight">Exponent</span>
            </Link>
          </motion.div>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400/80 mb-4 block">
                Live NSE · BSE
              </span>
              <h1 className="text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight mb-5">
                <span className="text-white/95">The smartest way to</span>
                <br />
                <span className="gradient-text animate-gradient">track your portfolio</span>
              </h1>
              <p className="text-sm xl:text-base text-zinc-400 max-w-sm leading-relaxed">
                Real-time NSE & BSE data, AI-powered insights, professional screeners — built for serious Indian investors.
              </p>
            </motion.div>

            {/* Market indices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 grid grid-cols-2 gap-3"
            >
              {INDICES.map((idx, i) => (
                <motion.div key={idx.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="glass-card-static rounded-xl p-3.5"
                >
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{idx.name}</div>
                  <div className="text-base font-bold text-white font-mono-num">{idx.value}</div>
                  <div className={`flex items-center gap-1 mt-0.5 text-xs font-semibold font-mono-num ${idx.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {idx.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {idx.change}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Scrolling stock ticker */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-6 overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02]"
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Live Feed</span>
              </div>
              <div className="flex gap-0 overflow-hidden py-2">
                <div className="flex gap-4 px-3 animate-[ticker_18s_linear_infinite]">
                  {[...STOCKS, ...STOCKS].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-zinc-400">{s.sym}</span>
                      <span className="text-xs font-bold text-white font-mono-num">{s.val}</span>
                      <span className={`text-[10px] font-bold font-mono-num ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.chg}</span>
                      <span className="text-zinc-700">·</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom stat */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-6 pt-8 border-t border-white/[0.04]">
            {[['10K+', 'Active Users'], ['₹500Cr+', 'Tracked'], ['99.9%', 'Uptime']].map(([val, label]) => (
              <div key={label}>
                <div className="text-base font-bold text-white font-mono-num">{val}</div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-10 relative">
        {/* Mobile-only orbs */}
        <div aria-hidden className="lg:hidden fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb orb-cyan   w-[500px] h-[500px]" style={{ top: '-10%', left: '-10%' }} />
          <div className="orb orb-violet w-[400px] h-[400px]" style={{ bottom: '-5%', right: '-10%' }} />
        </div>

        {/* Subtle divider */}
        <div className="hidden lg:block absolute left-0 inset-y-8 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-[400px]"
        >
          {/* Back — mobile only */}
          <Link href="/" className="lg:hidden flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8">
            ← Back to home
          </Link>

          <h1 className="text-2xl font-bold mb-1 text-white">Welcome back</h1>
          <p className="text-sm text-zinc-500 mb-8">Sign in to your Exponent account</p>

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => loginWithGoogle()} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-sm font-semibold hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 mb-5 group"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors ml-auto" />
          </motion.button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <span className="text-xs text-zinc-600 font-semibold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required disabled={loading}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] disabled:opacity-50 transition-all duration-150" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} disabled={loading}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] disabled:opacity-50 transition-all duration-150" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors p-1">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading || !email || !password}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl btn-primary-glow text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-sm text-zinc-500 text-center mt-7">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>

          {/* Back link — desktop */}
          <div className="hidden lg:block text-center mt-5">
            <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
