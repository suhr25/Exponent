'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LivePrice {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  updatedAt: number;
}

const BATCH_SIZE = 20; // Yahoo supports ~20 symbols per request
const REFRESH_INTERVAL = 30_000; // 30 seconds

// Global cache shared across all hook instances
const priceCache = new Map<string, LivePrice>();
const fetchingSymbols = new Set<string>();

async function fetchBatch(symbols: string[]): Promise<Map<string, LivePrice>> {
  const result = new Map<string, LivePrice>();
  if (symbols.length === 0) return result;

  try {
    const res = await fetch(`/api/yahoo/quote?symbols=${symbols.join(',')}`);
    if (!res.ok) return result;
    const data = await res.json();
    const prices = data?.prices || {};

    Object.entries(prices).forEach(([sym, price]) => {
      const p = price as LivePrice;
      priceCache.set(sym, p);
      result.set(sym, p);
    });
  } catch (e) {
    console.warn('Price fetch failed:', e);
  }

  return result;
}

/**
 * Hook to fetch real live prices for a list of stock symbols.
 * Batches requests, caches results, and auto-refreshes.
 */
export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, LivePrice>>(new Map());
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    // Filter symbols that need fetching (not in cache or stale)
    const toFetch = symbols.filter(s => {
      const cached = priceCache.get(s);
      if (!cached) return true;
      return Date.now() - cached.updatedAt > REFRESH_INTERVAL;
    });

    // Use cached prices for symbols we already have
    const newPrices = new Map<string, LivePrice>();
    symbols.forEach(s => {
      const cached = priceCache.get(s);
      if (cached) newPrices.set(s, cached);
    });

    if (toFetch.length === 0) {
      setPrices(newPrices);
      return;
    }

    setLoading(true);

    // Fetch in batches
    for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
      const batch = toFetch.slice(i, i + BATCH_SIZE);
      // Skip already-fetching symbols
      const needed = batch.filter(s => !fetchingSymbols.has(s));
      needed.forEach(s => fetchingSymbols.add(s));

      const batchPrices = await fetchBatch(needed);
      needed.forEach(s => fetchingSymbols.delete(s));

      batchPrices.forEach((price, sym) => {
        newPrices.set(sym, price);
      });

      if (mountedRef.current) {
        setPrices(new Map(newPrices));
      }
    }

    if (mountedRef.current) {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    mountedRef.current = true;
    fetchPrices();

    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchPrices]);

  return { prices, loading, refetch: fetchPrices };
}

/**
 * Hook to fetch full stock detail from Yahoo Finance.
 */
export function useStockDetail(symbol: string) {
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    fetch(`/api/yahoo/detail?symbol=${symbol}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setDetail(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  return { detail, loading, error };
}

/**
 * Hook to fetch real chart data from Yahoo Finance.
 */
export function useStockChart(symbol: string, range: string = '1y') {
  const [candles, setCandles] = useState<Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const interval = range === '1d' ? '5m' :
                   range === '5d' ? '15m' :
                   range === '1mo' ? '1h' :
                   range === '3mo' ? '1d' :
                   '1d';

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);

    fetch(`/api/yahoo/chart?symbol=${symbol}&range=${range}&interval=${interval}`)
      .then(res => res.json())
      .then(data => {
        if (data.candles && data.candles.length > 0) {
          setCandles(data.candles);
        }
      })
      .catch(err => console.warn('Chart fetch error:', err))
      .finally(() => setLoading(false));
  }, [symbol, range, interval]);

  return { candles, loading };
}
