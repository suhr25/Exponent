'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Bell, TrendingUp, TrendingDown, Building2, Users, Globe, Calendar } from 'lucide-react';
import { getMockStockDetail, generateMockCandles } from '@/lib/utils/mock-data';
import { formatCurrency, formatPercent, formatMarketCap, formatVolume, getChangeColor } from '@/lib/utils/formatters';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { CHART_PERIODS } from '@/lib/utils/constants';
import { generateTechnicalSignals, generateStockDNA } from '@/lib/utils/technicals';
import type { StockDetail } from '@/lib/types/market';
import dynamic from 'next/dynamic';

const StockDNA = dynamic(() => import('@/components/charts/StockDNA'), { ssr: false });
const TechnicalPanel = dynamic(() => import('@/components/charts/TechnicalPanel'), { ssr: false });
const AIChat = dynamic(() => import('@/components/shared/AIChat'), { ssr: false });
const OrderPad = dynamic(() => import('@/components/shared/OrderPad'), { ssr: false });

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [period, setPeriod] = useState('1Y');
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'ratios' | 'holdings'>('overview');
  const [isOrderPadOpen, setIsOrderPadOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<ReturnType<typeof generateMockCandles>>([]);

  useEffect(() => {
    setStock(getMockStockDetail(symbol));
  }, [symbol]);

  useEffect(() => {
    if (!stock) return;
    const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : period === '1Y' ? 365 : 1825;
    setCandles(generateMockCandles(days, stock.ltp));
  }, [stock, period]);

  // Chart rendering
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any = null;
    let rh: (() => void) | null = null;
    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;
      chart = lc.createChart(chartRef.current, {
        width: chartRef.current.clientWidth, height: 400,
        layout: { background: { type: lc.ColorType.Solid, color: 'transparent' }, textColor: '#71717a', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
        crosshair: { vertLine: { color: 'rgba(0,212,170,0.3)', style: lc.LineStyle.Dashed }, horzLine: { color: 'rgba(0,212,170,0.3)', style: lc.LineStyle.Dashed } },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.06)' },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cs = chart.addSeries(lc.CandlestickSeries, { upColor: '#10b981', downColor: '#ef4444', borderUpColor: '#10b981', borderDownColor: '#ef4444', wickUpColor: '#10b98180', wickDownColor: '#ef444480' });
      cs.setData(candles.map((c: { timestamp: number; open: number; high: number; low: number; close: number }) => ({ time: c.timestamp as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      const vs = chart.addSeries(lc.HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
      vs.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      vs.setData(candles.map((c: { timestamp: number; volume: number; close: number; open: number }) => ({ time: c.timestamp as any, value: c.volume, color: c.close >= c.open ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' })));
      chart.timeScale().fitContent();
      rh = () => { if (chart && chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
      window.addEventListener('resize', rh);
    });
    return () => { if (rh) window.removeEventListener('resize', rh); if (chart) chart.remove(); };
  }, [candles]);

  if (!stock) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;

  const technicals = generateTechnicalSignals(candles);
  const dna = generateStockDNA(candles, stock.pe || 25, stock.roe, stock.debtToEquity, stock.pb || 3, stock.dividendYield || 0);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (dna.fundamentals > 60) strengths.push('Strong fundamentals');
  if (dna.value > 60) strengths.push('Attractive valuation');
  if (dna.momentum > 60) strengths.push('Positive momentum');
  if (dna.growth > 60) strengths.push('Good growth trajectory');
  if (dna.fundamentals < 40) weaknesses.push('Weak fundamentals');
  if (dna.value < 40) weaknesses.push('Expensive valuation');
  if (dna.volatility < 40) weaknesses.push('High volatility');
  if (dna.momentum < 40) weaknesses.push('Negative momentum');

  const w52Range = stock.high52w && stock.low52w ? ((stock.ltp - stock.low52w) / (stock.high52w - stock.low52w)) * 100 : 50;
  const mcapLabel = (stock.marketCap || 0) > 20000e8 ? 'Large Cap' : (stock.marketCap || 0) > 5000e8 ? 'Mid Cap' : 'Small Cap';

  const keyMetrics = [
    { label: 'Market Cap', value: stock.marketCap ? formatMarketCap(stock.marketCap) : '—' },
    { label: 'P/E Ratio', value: stock.pe?.toFixed(1) ?? '—' },
    { label: 'P/B Ratio', value: stock.pb?.toFixed(1) ?? '—' },
    { label: 'EPS (TTM)', value: `₹${stock.eps}` },
    { label: 'Div. Yield', value: stock.dividendYield ? `${stock.dividendYield}%` : '—' },
    { label: 'Book Value', value: `₹${stock.bookValue}` },
    { label: 'D/E Ratio', value: stock.debtToEquity.toString() },
    { label: 'ROE', value: `${stock.roe}%` },
  ];

  const peers = [
    { sym: 'RELIANCE', pe: 28.4, pb: 2.8, roe: 12.5, mcap: '₹19.5T', ytd: '+18%' },
    { sym: 'TCS', pe: 32.1, pb: 14.2, roe: 45.2, mcap: '₹14.0T', ytd: '+12%' },
    { sym: 'HDFCBANK', pe: 19.8, pb: 3.1, roe: 16.8, mcap: '₹12.8T', ytd: '+22%' },
    { sym: 'INFY', pe: 25.6, pb: 8.4, roe: 31.5, mcap: '₹6.5T', ytd: '+8%' },
    { sym: 'ICICIBANK', pe: 17.9, pb: 3.4, roe: 17.2, mcap: '₹8.7T', ytd: '+28%' },
  ].filter(p => p.sym !== symbol).slice(0, 4);

  const aiPrompt = `You are an expert Indian stock market analyst specializing in BSE/NSE listed stocks. You are analyzing ${symbol} (${stock.companyName}). Current data: Price ₹${stock.ltp}, P/E ${stock.pe}, Market Cap ₹${stock.marketCap ? (stock.marketCap/1e7).toFixed(0) : '?'}Cr, 52W High ₹${stock.high52w}, 52W Low ₹${stock.low52w}, RSI ${technicals.signals[0]?.value}, MACD ${technicals.signals[1]?.value}. Provide concise, data-driven analysis. Use Indian market context. Always end with a risk disclaimer. Max 3 paragraphs.`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/screener" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{stock.symbol}</h1>
              <span className="px-2 py-0.5 rounded-md bg-surface-600 text-xs text-zinc-400 font-medium">NSE</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${mcapLabel === 'Large Cap' ? 'bg-cyan-500/10 text-cyan-400' : mcapLabel === 'Mid Cap' ? 'bg-violet-500/10 text-violet-400' : 'bg-amber-500/10 text-amber-400'}`}>{mcapLabel}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-zinc-500">{stock.sector}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">{stock.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOrderPadOpen(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050507] font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
            Trade
          </button>
          <button onClick={() => isInWatchlist(stock.symbol) ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol)} className={`p-2.5 rounded-xl transition-all ${isInWatchlist(stock.symbol) ? 'bg-yellow-500/10 text-yellow-400' : 'glass text-zinc-400 hover:text-white'}`}>
            <Star className={`w-5 h-5 ${isInWatchlist(stock.symbol) ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white transition-all"><Bell className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Price + 52W Bar */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <span className="text-4xl font-bold">{formatCurrency(stock.ltp)}</span>
          <div className={`flex items-center gap-1 text-lg font-semibold ${getChangeColor(stock.change)}`}>
            {stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
          </div>
        </div>
        {/* 52W Range Bar */}
        {stock.high52w && stock.low52w && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span>52W Low: {formatCurrency(stock.low52w)}</span>
              <span>52W High: {formatCurrency(stock.high52w)}</span>
            </div>
            <div className="relative h-2 rounded-full bg-zinc-800">
              <div className="absolute left-0 h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" style={{ width: '100%', opacity: 0.3 }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/30" style={{ left: `${Math.max(2, Math.min(98, w52Range))}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
          </div>
        )}
        {/* Period Selector */}
        <div className="flex gap-1 mb-4">
          {CHART_PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>{p.label}</button>
          ))}
        </div>
        <div ref={chartRef} className="rounded-lg overflow-hidden" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {keyMetrics.map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{m.label}</div>
            <div className="text-sm font-bold text-white font-mono tabular-nums">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Stock DNA + Technicals Side-by-Side */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <StockDNA scores={dna} strengths={strengths.slice(0, 3)} weaknesses={weaknesses.slice(0, 3)} />
        </div>
        <div className="lg:col-span-3">
          <TechnicalPanel data={technicals} />
        </div>
      </div>

      {/* Tabs: Overview / Financials / Ratios / Shareholding */}
      <div className="flex gap-1 border-b border-zinc-800/50">
        {(['overview', 'financials', 'ratios', 'holdings'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-zinc-500 border-transparent hover:text-white'}`}>{tab === 'holdings' ? 'Shareholding' : tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">About</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{stock.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">{stock.sector}</span></div>
              <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">{stock.employees?.toLocaleString()} employees</span></div>
              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">Founded {stock.founded}</span></div>
              <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-zinc-500" /><a href={stock.website} className="text-cyan-400 hover:text-cyan-300">{stock.website}</a></div>
            </div>
          </div>
          {/* Peer Comparison */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">Peer Comparison</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Stock</th><th className="text-right">P/E</th><th className="text-right">P/B</th><th className="text-right">ROE</th><th className="text-right">YTD</th></tr></thead>
                <tbody>
                  <tr className="bg-cyan-500/[0.03]"><td className="font-bold text-cyan-400">{symbol}</td><td className="text-right">{stock.pe?.toFixed(1)}</td><td className="text-right">{stock.pb?.toFixed(1)}</td><td className="text-right">{stock.roe}%</td><td className="text-right text-emerald-400">—</td></tr>
                  {peers.map(p => (<tr key={p.sym}><td><Link href={`/dashboard/stock/${p.sym}`} className="text-zinc-300 hover:text-cyan-400">{p.sym}</Link></td><td className="text-right">{p.pe}</td><td className="text-right">{p.pb}</td><td className="text-right">{p.roe}%</td><td className="text-right text-emerald-400">{p.ytd}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Period</th><th className="text-right">Revenue (Cr)</th><th className="text-right">Net Profit (Cr)</th><th className="text-right">EPS</th><th className="text-right">OPM %</th></tr></thead>
              <tbody>{stock.financials.map((f) => (<tr key={f.period}><td className="font-medium">{f.period}</td><td className="text-right">{formatCurrency(f.revenue)}</td><td className="text-right">{formatCurrency(f.netProfit)}</td><td className="text-right">{f.eps}</td><td className="text-right">{f.operatingMargin}%</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ratios' && (
        <div className="glass-card rounded-xl p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'P/E Ratio', value: stock.pe?.toFixed(1), benchmark: '22.5', better: (stock.pe || 0) < 22.5 },
              { label: 'P/B Ratio', value: stock.pb?.toFixed(1), benchmark: '4.0', better: (stock.pb || 0) < 4 },
              { label: 'ROE', value: `${stock.roe}%`, benchmark: '15%', better: stock.roe > 15 },
              { label: 'ROCE', value: `${stock.roce}%`, benchmark: '18%', better: stock.roce > 18 },
              { label: 'Debt/Equity', value: stock.debtToEquity, benchmark: '0.8', better: stock.debtToEquity < 0.8 },
              { label: 'Dividend Yield', value: `${stock.dividendYield || 0}%`, benchmark: '1.5%', better: (stock.dividendYield || 0) > 1.5 },
              { label: 'EPS', value: `₹${stock.eps}`, benchmark: '—', better: true },
              { label: 'Book Value', value: `₹${stock.bookValue}`, benchmark: '—', better: true },
              { label: 'Face Value', value: `₹${stock.faceValue}`, benchmark: '—', better: true },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <div>
                  <div className="text-xs text-zinc-500">{r.label}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{r.value}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-600">Sector Avg</div>
                  <div className={`text-xs font-semibold ${r.better ? 'text-emerald-400' : 'text-red-400'}`}>{r.benchmark}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-base font-semibold mb-4">Shareholding Pattern</h3>
          <div className="space-y-3">
            {[
              { label: 'Promoters', value: stock.promoterHolding, color: '#06b6d4' },
              { label: 'FII', value: stock.fiiHolding, color: '#8b5cf6' },
              { label: 'DII', value: stock.diiHolding, color: '#10b981' },
              { label: 'Public', value: +(100 - stock.promoterHolding - stock.fiiHolding - stock.diiHolding).toFixed(1), color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1"><span className="text-zinc-300">{item.label}</span><span className="text-zinc-400 font-mono">{item.value}%</span></div>
                <div className="h-2 rounded-full bg-zinc-800"><motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: item.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIChat stockSymbol={symbol} companyName={stock.companyName} systemPrompt={aiPrompt} />

      {/* Order Pad */}
      <OrderPad isOpen={isOrderPadOpen} onClose={() => setIsOrderPadOpen(false)} symbol={stock.symbol} currentPrice={stock.ltp} />
    </motion.div>
  );
}
