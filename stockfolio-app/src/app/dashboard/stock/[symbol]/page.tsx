'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Bell, TrendingUp, TrendingDown, Building2, Users, Globe, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercent, formatMarketCap, formatVolume, getChangeColor } from '@/lib/utils/formatters';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useStocksStore } from '@/lib/store/useStocksStore';
import { useStockDetail, useStockChart } from '@/lib/hooks/useLivePrices';
import { CHART_PERIODS } from '@/lib/utils/constants';
import dynamic from 'next/dynamic';

const AIChat = dynamic(() => import('@/components/shared/AIChat'), { ssr: false });
const OrderPad = dynamic(() => import('@/components/shared/OrderPad'), { ssr: false });

const RANGE_MAP: Record<string, string> = {
  '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y', '5Y': '5y',
};

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const { getStock: getStockInfo } = useStocksStore();
  const [period, setPeriod] = useState('1Y');
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'ratios'>('overview');
  const [isOrderPadOpen, setIsOrderPadOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch REAL data from Yahoo Finance
  const { detail, loading: detailLoading } = useStockDetail(symbol);
  const { candles, loading: chartLoading } = useStockChart(symbol, RANGE_MAP[period] || '1y');

  const bseStock = getStockInfo(symbol);

  // Chart rendering with real candles
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
      cs.setData(candles.map((c) => ({ time: c.timestamp as any, open: c.open, high: c.high, low: c.low, close: c.close })));
      const vs = chart.addSeries(lc.HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
      vs.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      vs.setData(candles.map((c) => ({ time: c.timestamp as any, value: c.volume, color: c.close >= c.open ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' })));
      chart.timeScale().fitContent();
      rh = () => { if (chart && chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
      window.addEventListener('resize', rh);
    });
    return () => { if (rh) window.removeEventListener('resize', rh); if (chart) chart.remove(); };
  }, [candles]);

  // Loading state
  if (detailLoading || !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-zinc-500">Loading real market data for {symbol}...</p>
      </div>
    );
  }

  const d = detail as Record<string, unknown>;
  const ltp = (d.ltp as number) || 0;
  const change = (d.change as number) || 0;
  const changePct = (d.changePercent as number) || 0;
  const high52w = (d.high52w as number) || 0;
  const low52w = (d.low52w as number) || 0;
  const marketCap = (d.marketCap as number) || 0;
  const companyName = (d.companyName as string) || bseStock?.name || symbol;
  const sector = (d.sector as string) || bseStock?.sector || 'N/A';
  const industry = (d.industry as string) || 'N/A';
  const description = (d.description as string) || '';
  const website = (d.website as string) || '';
  const employees = (d.employees as number) || 0;
  const pe = d.pe as number | null;
  const pb = d.pb as number | null;
  const eps = d.eps as number | null;
  const roe = d.roe as number | null;
  const roa = d.roa as number | null;
  const debtToEquity = d.debtToEquity as number | null;
  const dividendYield = d.dividendYield as number | null;
  const beta = d.beta as number | null;
  const profitMargin = d.profitMargin as number | null;
  const operatingMargin = d.operatingMargin as number | null;
  const grossMargin = d.grossMargin as number | null;
  const revenueGrowth = d.revenueGrowth as number | null;
  const earningsGrowth = d.earningsGrowth as number | null;
  const bookValue = d.bookValue as number | null;
  const currentRatio = d.currentRatio as number | null;
  const targetPrice = d.targetMeanPrice as number | null;
  const recommendation = d.recommendationKey as string | null;
  const insiders = d.insidersPercentHeld as number | null;
  const institutions = d.institutionsPercentHeld as number | null;
  const freeCashflow = d.freeCashflow as number | null;
  const totalRevenue = d.totalRevenue as number | null;
  const totalDebt = d.totalDebt as number | null;
  const totalCash = d.totalCash as number | null;
  const financials = (d.financials as Array<Record<string, unknown>>) || [];

  const w52Range = high52w && low52w ? ((ltp - low52w) / (high52w - low52w)) * 100 : 50;
  const mcapLabel = marketCap > 20000e8 ? 'Large Cap' : marketCap > 5000e8 ? 'Mid Cap' : 'Small Cap';

  const keyMetrics = [
    { label: 'Market Cap', value: marketCap ? formatMarketCap(marketCap) : '—' },
    { label: 'P/E Ratio', value: pe?.toFixed(1) ?? '—' },
    { label: 'P/B Ratio', value: pb?.toFixed(1) ?? '—' },
    { label: 'EPS (TTM)', value: eps ? `₹${eps.toFixed(2)}` : '—' },
    { label: 'Div. Yield', value: dividendYield ? `${dividendYield.toFixed(2)}%` : '—' },
    { label: 'Book Value', value: bookValue ? `₹${bookValue.toFixed(2)}` : '—' },
    { label: 'Beta', value: beta?.toFixed(2) ?? '—' },
    { label: 'ROE', value: roe ? `${roe.toFixed(1)}%` : '—' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/screener" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{symbol}</h1>
              <span className="px-2 py-0.5 rounded-md bg-surface-600 text-xs text-zinc-400 font-medium">NSE</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${mcapLabel === 'Large Cap' ? 'bg-cyan-500/10 text-cyan-400' : mcapLabel === 'Mid Cap' ? 'bg-violet-500/10 text-violet-400' : 'bg-amber-500/10 text-amber-400'}`}>{mcapLabel}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-zinc-500">{sector}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">{companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOrderPadOpen(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050507] font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">Trade</button>
          <button onClick={() => isInWatchlist(symbol) ? removeFromWatchlist(symbol) : addToWatchlist(symbol)} className={`p-2.5 rounded-xl transition-all ${isInWatchlist(symbol) ? 'bg-yellow-500/10 text-yellow-400' : 'glass text-zinc-400 hover:text-white'}`}>
            <Star className={`w-5 h-5 ${isInWatchlist(symbol) ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white transition-all"><Bell className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Price + 52W Bar */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <span className="text-4xl font-bold">{formatCurrency(ltp)}</span>
          <div className={`flex items-center gap-1 text-lg font-semibold ${getChangeColor(change)}`}>
            {change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({formatPercent(changePct)})
          </div>
          {recommendation && (
            <span className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
              recommendation === 'buy' || recommendation === 'strong_buy' ? 'bg-emerald-500/15 text-emerald-400' :
              recommendation === 'sell' || recommendation === 'strong_sell' ? 'bg-red-500/15 text-red-400' :
              'bg-amber-500/15 text-amber-400'
            }`}>
              Analyst: {recommendation.replace('_', ' ')}
            </span>
          )}
        </div>
        {/* 52W Range Bar */}
        {high52w > 0 && low52w > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span>52W Low: {formatCurrency(low52w)}</span>
              <span>52W High: {formatCurrency(high52w)}</span>
            </div>
            <div className="relative h-2 rounded-full bg-zinc-800">
              <div className="absolute left-0 h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" style={{ width: '100%', opacity: 0.3 }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/30" style={{ left: `${Math.max(2, Math.min(98, w52Range))}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
          </div>
        )}
        {targetPrice && (
          <div className="mb-4 text-xs text-zinc-500">
            Analyst Target: <span className="text-white font-semibold">{formatCurrency(targetPrice)}</span>
            {ltp > 0 && <span className={ltp < targetPrice ? 'text-emerald-400 ml-1' : 'text-red-400 ml-1'}>({((targetPrice - ltp) / ltp * 100).toFixed(1)}% {ltp < targetPrice ? 'upside' : 'downside'})</span>}
          </div>
        )}
        {/* Period Selector */}
        <div className="flex gap-1 mb-4">
          {CHART_PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.value ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>{p.label}</button>
          ))}
        </div>
        <div className="relative">
          {chartLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050507]/50 z-10 rounded-lg">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          )}
          <div ref={chartRef} className="rounded-lg overflow-hidden" />
        </div>
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800/50">
        {(['overview', 'financials', 'ratios'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'text-cyan-400 border-cyan-400' : 'text-zinc-500 border-transparent hover:text-white'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">About</h3>
            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-6">{description || 'No description available.'}</p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">{industry}</span></div>
              {employees > 0 && <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">{employees.toLocaleString()} employees</span></div>}
              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-zinc-500" /><span className="text-zinc-400">{sector}</span></div>
              {website && <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-zinc-500" /><a href={website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 truncate">{website}</a></div>}
            </div>
          </div>

          {/* Key Financial Highlights */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">Financial Highlights</h3>
            <div className="space-y-3">
              {[
                { label: 'Revenue', value: totalRevenue ? formatMarketCap(totalRevenue) : '—' },
                { label: 'Free Cash Flow', value: freeCashflow ? formatMarketCap(freeCashflow) : '—' },
                { label: 'Total Cash', value: totalCash ? formatMarketCap(totalCash) : '—' },
                { label: 'Total Debt', value: totalDebt ? formatMarketCap(totalDebt) : '—' },
                { label: 'Profit Margin', value: profitMargin ? `${profitMargin.toFixed(1)}%` : '—' },
                { label: 'Revenue Growth', value: revenueGrowth ? `${revenueGrowth.toFixed(1)}%` : '—' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="glass-card rounded-xl overflow-hidden">
          {financials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Period</th><th className="text-right">Revenue</th><th className="text-right">Net Profit</th><th className="text-right">Operating Income</th></tr></thead>
                <tbody>{financials.map((f, i) => (
                  <tr key={i}>
                    <td className="font-medium">{(f.period as string) || 'N/A'}</td>
                    <td className="text-right">{f.revenue ? formatMarketCap(f.revenue as number) : '—'}</td>
                    <td className="text-right">{f.netProfit ? formatMarketCap(f.netProfit as number) : '—'}</td>
                    <td className="text-right">{f.operatingIncome ? formatMarketCap(f.operatingIncome as number) : '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">No financial data available from Yahoo Finance for this stock.</div>
          )}
        </div>
      )}

      {activeTab === 'ratios' && (
        <div className="glass-card rounded-xl p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'P/E Ratio', value: pe?.toFixed(1) ?? '—', good: pe != null && pe < 25 },
              { label: 'P/B Ratio', value: pb?.toFixed(1) ?? '—', good: pb != null && pb < 4 },
              { label: 'ROE', value: roe ? `${roe.toFixed(1)}%` : '—', good: roe != null && roe > 15 },
              { label: 'ROA', value: roa ? `${roa.toFixed(1)}%` : '—', good: roa != null && roa > 5 },
              { label: 'Debt/Equity', value: debtToEquity?.toFixed(2) ?? '—', good: debtToEquity != null && debtToEquity < 1 },
              { label: 'Current Ratio', value: currentRatio?.toFixed(2) ?? '—', good: currentRatio != null && currentRatio > 1.5 },
              { label: 'Profit Margin', value: profitMargin ? `${profitMargin.toFixed(1)}%` : '—', good: profitMargin != null && profitMargin > 10 },
              { label: 'Operating Margin', value: operatingMargin ? `${operatingMargin.toFixed(1)}%` : '—', good: operatingMargin != null && operatingMargin > 15 },
              { label: 'Gross Margin', value: grossMargin ? `${grossMargin.toFixed(1)}%` : '—', good: grossMargin != null && grossMargin > 30 },
              { label: 'Revenue Growth', value: revenueGrowth ? `${revenueGrowth.toFixed(1)}%` : '—', good: revenueGrowth != null && revenueGrowth > 0 },
              { label: 'Earnings Growth', value: earningsGrowth ? `${earningsGrowth.toFixed(1)}%` : '—', good: earningsGrowth != null && earningsGrowth > 0 },
              { label: 'Dividend Yield', value: dividendYield ? `${dividendYield.toFixed(2)}%` : '—', good: dividendYield != null && dividendYield > 1 },
              { label: 'EPS (TTM)', value: eps ? `₹${eps.toFixed(2)}` : '—', good: true },
              { label: 'Book Value', value: bookValue ? `₹${bookValue.toFixed(2)}` : '—', good: true },
              { label: 'Beta', value: beta?.toFixed(2) ?? '—', good: beta != null && beta < 1.5 },
              { label: 'Insiders Held', value: insiders ? `${insiders.toFixed(1)}%` : '—', good: insiders != null && insiders > 40 },
              { label: 'Institutions Held', value: institutions ? `${institutions.toFixed(1)}%` : '—', good: true },
              { label: 'Avg Volume', value: (d.avgVolume as number) ? formatVolume(d.avgVolume as number) : '—', good: true },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <div>
                  <div className="text-xs text-zinc-500">{r.label}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{r.value}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${r.value === '—' ? 'bg-zinc-700' : r.good ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat */}
      <AIChat stockSymbol={symbol} companyName={companyName} systemPrompt={`You are an expert Indian stock market analyst. Analyzing ${symbol} (${companyName}). Current price: ₹${ltp}, P/E: ${pe}, Market Cap: ${marketCap ? formatMarketCap(marketCap) : '?'}, ROE: ${roe}%, Sector: ${sector}. Provide data-driven analysis. Always end with risk disclaimer.`} />

      {/* Order Pad */}
      <OrderPad isOpen={isOrderPadOpen} onClose={() => setIsOrderPadOpen(false)} symbol={symbol} currentPrice={ltp} />
    </motion.div>
  );
}
