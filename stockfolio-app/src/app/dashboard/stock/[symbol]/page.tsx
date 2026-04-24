'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, Bell, TrendingUp, TrendingDown,
  Building2, Users, Globe, Calendar, DollarSign
} from 'lucide-react';
import { getMockStockDetail, generateMockCandles } from '@/lib/utils/mock-data';
import { formatCurrency, formatPercent, formatMarketCap, formatVolume, getChangeColor, getChangeBg } from '@/lib/utils/formatters';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { CHART_PERIODS } from '@/lib/utils/constants';
import type { StockDetail } from '@/lib/types/market';

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [period, setPeriod] = useState('1Y');
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'holdings'>('overview');
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStock(getMockStockDetail(symbol));
  }, [symbol]);

  // Lightweight Charts integration (v5 API)
  useEffect(() => {
    if (!chartRef.current || !stock) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any = null;
    let resizeHandler: (() => void) | null = null;

    import('lightweight-charts').then((lc) => {
      if (!chartRef.current) return;

      chart = lc.createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#71717a',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          vertLine: { color: 'rgba(6,182,212,0.3)', style: lc.LineStyle.Dashed },
          horzLine: { color: 'rgba(6,182,212,0.3)', style: lc.LineStyle.Dashed },
        },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.06)' },
      });

      const days = period === '1D' ? 1 : period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : period === '1Y' ? 365 : 1825;
      const candles = generateMockCandles(days, stock.ltp);

      // v5 API: use addSeries with CandlestickSeries type
      const candleSeries = chart.addSeries(lc.CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b98180',
        wickDownColor: '#ef444480',
      });

      candleSeries.setData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candles.map((c: { timestamp: number; open: number; high: number; low: number; close: number }) => ({
          time: c.timestamp as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // v5 API: use addSeries with HistogramSeries type
      const volumeSeries = chart.addSeries(lc.HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candles.map((c: { timestamp: number; volume: number; close: number; open: number }) => ({
          time: c.timestamp as any,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        }))
      );

      chart.timeScale().fitContent();

      // Resize handler
      resizeHandler = () => {
        if (chart && chartRef.current) {
          chart.applyOptions({ width: chartRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', resizeHandler);
    });

    return () => {
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
      if (chart) chart.remove();
    };
  }, [stock, period]);

  if (!stock) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const keyMetrics = [
    { label: 'Market Cap', value: stock.marketCap ? formatMarketCap(stock.marketCap) : '—' },
    { label: 'P/E Ratio', value: stock.pe?.toFixed(1) ?? '—' },
    { label: 'P/B Ratio', value: stock.pb?.toFixed(1) ?? '—' },
    { label: 'ROCE', value: `${stock.roce}%` },
    { label: 'ROE', value: `${stock.roe}%` },
    { label: 'D/E Ratio', value: stock.debtToEquity.toString() },
    { label: 'EPS', value: `₹${stock.eps}` },
    { label: 'Div. Yield', value: stock.dividendYield ? `${stock.dividendYield}%` : '—' },
    { label: 'Volume', value: formatVolume(stock.volume) },
    { label: 'Book Value', value: `₹${stock.bookValue}` },
    { label: '52W High', value: stock.high52w ? formatCurrency(stock.high52w) : '—' },
    { label: '52W Low', value: stock.low52w ? formatCurrency(stock.low52w) : '—' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/screener" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{stock.symbol}</h1>
              <span className="px-2 py-0.5 rounded-md bg-surface-600 text-xs text-zinc-400 font-medium">NSE</span>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">{stock.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => isInWatchlist(stock.symbol) ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock.symbol)}
            className={`p-2.5 rounded-xl transition-all ${isInWatchlist(stock.symbol) ? 'bg-yellow-500/10 text-yellow-400' : 'glass text-zinc-400 hover:text-white'}`}
          >
            <Star className={`w-5 h-5 ${isInWatchlist(stock.symbol) ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2.5 rounded-xl glass text-zinc-400 hover:text-white transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Price Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-end gap-4 mb-6">
          <span className="text-4xl font-bold">{formatCurrency(stock.ltp)}</span>
          <div className={`flex items-center gap-1 text-lg font-semibold ${getChangeColor(stock.change)}`}>
            {stock.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
          </div>
        </div>

        {/* Chart Period Selector */}
        <div className="flex gap-1 mb-4">
          {CHART_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.value
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div ref={chartRef} className="rounded-lg overflow-hidden" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {keyMetrics.map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{m.label}</div>
            <div className="text-sm font-semibold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800/50 pb-0">
        {(['overview', 'financials', 'holdings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-cyan-400 border-cyan-400'
                : 'text-zinc-500 border-transparent hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">About</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{stock.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">{stock.sector}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">{stock.employees?.toLocaleString()} employees</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Founded {stock.founded}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-zinc-500" />
                <a href={stock.website} className="text-cyan-400 hover:text-cyan-300">{stock.website}</a>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-base font-semibold mb-3">Shareholding Pattern</h3>
            <div className="space-y-3">
              {[
                { label: 'Promoters', value: stock.promoterHolding, color: '#06b6d4' },
                { label: 'FII', value: stock.fiiHolding, color: '#8b5cf6' },
                { label: 'DII', value: stock.diiHolding, color: '#10b981' },
                { label: 'Public', value: +(100 - stock.promoterHolding - stock.fiiHolding - stock.diiHolding).toFixed(1), color: '#f59e0b' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{item.label}</span>
                    <span className="text-zinc-400">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th className="text-right">Revenue (Cr)</th>
                  <th className="text-right">Net Profit (Cr)</th>
                  <th className="text-right">EPS</th>
                  <th className="text-right">OPM %</th>
                </tr>
              </thead>
              <tbody>
                {stock.financials.map((f) => (
                  <tr key={f.period}>
                    <td className="font-medium">{f.period}</td>
                    <td className="text-right">{formatCurrency(f.revenue)}</td>
                    <td className="text-right">{formatCurrency(f.netProfit)}</td>
                    <td className="text-right">{f.eps}</td>
                    <td className="text-right">{f.operatingMargin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'holdings' && (
        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-zinc-400">Detailed shareholding data will be available with real API integration.</p>
        </div>
      )}
    </motion.div>
  );
}
