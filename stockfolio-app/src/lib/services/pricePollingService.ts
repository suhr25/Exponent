// ─── Price Polling Service (Singleton) ───────────────────────────────────────
// Batches stock price requests by priority level and dispatches updates to the store.

import { isMarketOpen } from '@/lib/utils/marketHours';
import { useStocksStore, type PriceData } from '@/lib/store/useStocksStore';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';

export type PricePriority = 'HIGH' | 'MEDIUM' | 'LOW';

interface Subscription {
  symbol: string;
  priority: PricePriority;
  callback?: (price: PriceData) => void;
}

const POLL_INTERVALS: Record<PricePriority, number> = {
  HIGH: 3000,
  MEDIUM: 10000,
  LOW: 30000,
};

class PricePollingService {
  private static instance: PricePollingService;
  private subscriptions: Map<string, Subscription[]> = new Map();
  private timers: Map<PricePriority, ReturnType<typeof setInterval> | null> = new Map();
  private isRunning = false;
  private hasFetchedOnce = false;

  static getInstance(): PricePollingService {
    if (!PricePollingService.instance) {
      PricePollingService.instance = new PricePollingService();
    }
    return PricePollingService.instance;
  }

  /** Subscribe a symbol for price updates */
  subscribe(symbol: string, priority: PricePriority = 'MEDIUM', callback?: (price: PriceData) => void): () => void {
    const sub: Subscription = { symbol, priority, callback };
    const existing = this.subscriptions.get(symbol) || [];
    existing.push(sub);
    this.subscriptions.set(symbol, existing);

    // Start polling if not running
    if (!this.isRunning) {
      this.start();
    }

    // Return unsubscribe function
    return () => this.unsubscribe(symbol, callback);
  }

  /** Unsubscribe a specific callback for a symbol */
  unsubscribe(symbol: string, callback?: (price: PriceData) => void) {
    const subs = this.subscriptions.get(symbol);
    if (!subs) return;

    if (callback) {
      const filtered = subs.filter(s => s.callback !== callback);
      if (filtered.length === 0) {
        this.subscriptions.delete(symbol);
      } else {
        this.subscriptions.set(symbol, filtered);
      }
    } else {
      this.subscriptions.delete(symbol);
    }

    // Stop if no more subscriptions
    if (this.subscriptions.size === 0) {
      this.stop();
    }
  }

  /** Start all polling timers */
  private start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial fetch
    this.fetchAll();

    // Set up priority-based intervals
    for (const priority of ['HIGH', 'MEDIUM', 'LOW'] as PricePriority[]) {
      const timer = setInterval(() => {
        // Only poll during market hours (or if never fetched)
        if (isMarketOpen() || !this.hasFetchedOnce) {
          this.fetchByPriority(priority);
        }
      }, POLL_INTERVALS[priority]);
      this.timers.set(priority, timer);
    }
  }

  /** Stop all polling */
  stop() {
    this.isRunning = false;
    this.timers.forEach(timer => {
      if (timer) clearInterval(timer);
    });
    this.timers.clear();
  }

  /** Get highest priority for a symbol */
  private getSymbolPriority(symbol: string): PricePriority {
    const subs = this.subscriptions.get(symbol) || [];
    if (subs.some(s => s.priority === 'HIGH')) return 'HIGH';
    if (subs.some(s => s.priority === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  /** Fetch prices for a specific priority tier */
  private async fetchByPriority(priority: PricePriority) {
    const symbols: string[] = [];
    this.subscriptions.forEach((subs, symbol) => {
      if (this.getSymbolPriority(symbol) === priority) {
        symbols.push(symbol);
      }
    });

    if (symbols.length === 0) return;
    await this.fetchPrices(symbols);
  }

  /** Fetch all subscribed symbols */
  private async fetchAll() {
    const symbols = Array.from(this.subscriptions.keys());
    if (symbols.length === 0) return;
    await this.fetchPrices(symbols);
    this.hasFetchedOnce = true;
  }

  /** Fetch prices from API with mock fallback */
  private async fetchPrices(symbols: string[]) {
    try {
      // Try our market quote proxy (which hits Groww Trading API)
      const res = await fetch(`/api/market/quote?symbols=${symbols.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.quotes && !data.mock) {
          // Parse Groww response into our PriceData format
          const prices: Record<string, PriceData> = {};
          for (const [symbol, quoteData] of Object.entries(data.quotes)) {
            const q = quoteData as Record<string, unknown>;
            prices[symbol] = {
              ltp: Number(q.ltp || q.lastTradedPrice || 0),
              open: Number(q.open || q.openPrice || 0),
              high: Number(q.high || q.highPrice || 0),
              low: Number(q.low || q.lowPrice || 0),
              close: Number(q.close || q.closePrice || 0),
              volume: Number(q.volume || q.tradedVolume || 0),
              change: Number(q.change || q.netChange || 0),
              changePercent: Number(q.changePercent || q.percentChange || 0),
              updatedAt: Date.now(),
            };
          }
          if (Object.keys(prices).length > 0) {
            this.dispatchPrices(prices);
            return;
          }
        }
      }
    } catch {
      // Fall through to mock
    }

    // Mock fallback: generate realistic prices
    this.dispatchMockPrices(symbols);
  }

  /** Dispatch mock prices based on MOCK_QUOTES data */
  private dispatchMockPrices(symbols: string[]) {
    const updates: Record<string, PriceData> = {};
    const store = useStocksStore.getState();

    symbols.forEach(symbol => {
      const mockQuote = MOCK_QUOTES.find(q => q.symbol === symbol);
      const existing = store.getPrice(symbol);

      // Small random price movement if we have existing data
      const base = existing?.ltp || mockQuote?.ltp || 1000 + Math.random() * 2000;
      const jitter = base * (Math.random() - 0.48) * 0.002; // ±0.1% movement
      const ltp = +(base + jitter).toFixed(2);
      const close = mockQuote?.close || base;
      const change = +(ltp - close).toFixed(2);
      const changePercent = +((change / close) * 100).toFixed(2);

      updates[symbol] = {
        ltp,
        open: mockQuote?.open || base * 0.998,
        high: mockQuote?.high || Math.max(ltp, base * 1.01),
        low: mockQuote?.low || Math.min(ltp, base * 0.99),
        close,
        volume: mockQuote?.volume || Math.floor(5000000 + Math.random() * 10000000),
        change,
        changePercent,
        updatedAt: Date.now(),
      };
    });

    this.dispatchPrices(updates);
  }

  /** Push price updates to store and notify subscribers */
  private dispatchPrices(prices: Record<string, PriceData>) {
    useStocksStore.getState().updatePrices(prices);

    // Notify individual callbacks
    Object.entries(prices).forEach(([symbol, price]) => {
      const subs = this.subscriptions.get(symbol) || [];
      subs.forEach(sub => sub.callback?.(price));
    });
  }

  /** Get all currently subscribed symbols */
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /** Check if service is running */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const priceService = PricePollingService.getInstance();
export default PricePollingService;
