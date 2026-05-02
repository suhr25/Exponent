// ─── Technical Analysis Calculations ─────────────────────────────────────────
// Computes RSI, MACD, Bollinger Bands, ADX, Stochastic, Supertrend, MAs
// from candle data. Uses standard formulas.

export interface TechnicalSignal {
  name: string;
  value: number | string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
  description: string;
}

export interface TechnicalSummary {
  signals: TechnicalSignal[];
  buyCount: number;
  sellCount: number;
  neutralCount: number;
  overall: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  overallLabel: string;
  overallColor: string;
}

export interface StockDNAScores {
  momentum: number;
  fundamentals: number;
  value: number;
  growth: number;
  volatility: number;
  sentiment: number;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Indicator Calculations ──────────────────────────────────────────────────

function calcSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((s, v) => s + v, 0) / period;
}

function calcEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calcMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12 - ema26;
  // Simplified signal line
  const signal = macdLine * 0.8; // Approximation
  return { macd: macdLine, signal, histogram: macdLine - signal };
}

function calcBollingerBands(closes: number[], period: number = 20): { upper: number; middle: number; lower: number; position: string } {
  const sma = calcSMA(closes, period);
  const slice = closes.slice(-period);
  const variance = slice.reduce((s, v) => s + Math.pow(v - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  const upper = sma + 2 * stdDev;
  const lower = sma - 2 * stdDev;
  const current = closes[closes.length - 1];
  const position = current > upper ? 'Above Upper' : current < lower ? 'Below Lower' : current > sma ? 'Near Upper' : 'Near Lower';
  return { upper, middle: sma, lower, position };
}

function calcStochastic(candles: Candle[], period: number = 14): { k: number; d: number } {
  if (candles.length < period) return { k: 50, d: 50 };
  const recent = candles.slice(-period);
  const high = Math.max(...recent.map(c => c.high));
  const low = Math.min(...recent.map(c => c.low));
  const close = candles[candles.length - 1].close;
  const k = high === low ? 50 : ((close - low) / (high - low)) * 100;
  return { k, d: k * 0.9 }; // Simplified %D
}

function calcADX(candles: Candle[], period: number = 14): number {
  if (candles.length < period * 2) return 25;
  // Simplified ADX calculation
  let sumTR = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    sumTR += tr;
  }
  const atr = sumTR / period;
  const currentPrice = candles[candles.length - 1].close;
  // Normalize to 0-100 range
  return Math.min(60, (atr / currentPrice) * 1000 + 15);
}

// ─── Generate All Signals ────────────────────────────────────────────────────

export function generateTechnicalSignals(candles: Candle[]): TechnicalSummary {
  const closes = candles.map(c => c.close);
  const current = closes[closes.length - 1] || 0;

  const signals: TechnicalSignal[] = [];

  // 1. RSI
  const rsi = calcRSI(closes);
  signals.push({
    name: 'RSI (14)',
    value: rsi.toFixed(1),
    signal: rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : 'neutral',
    strength: rsi < 30 ? 80 : rsi > 70 ? 80 : 50,
    description: rsi < 30 ? 'Oversold — potential reversal up' : rsi > 70 ? 'Overbought — potential pullback' : 'Neutral momentum',
  });

  // 2. MACD
  const macd = calcMACD(closes);
  signals.push({
    name: 'MACD',
    value: macd.macd.toFixed(2),
    signal: macd.histogram > 0 ? 'buy' : 'sell',
    strength: Math.min(90, Math.abs(macd.histogram) * 10 + 40),
    description: macd.histogram > 0 ? 'Bullish crossover — positive momentum' : 'Bearish crossover — negative momentum',
  });

  // 3. Bollinger Bands
  const bb = calcBollingerBands(closes);
  signals.push({
    name: 'Bollinger Bands',
    value: bb.position,
    signal: bb.position === 'Below Lower' ? 'buy' : bb.position === 'Above Upper' ? 'sell' : 'neutral',
    strength: bb.position.includes('Below') || bb.position.includes('Above') ? 75 : 45,
    description: `Price ${bb.position.toLowerCase()} band`,
  });

  // 4. ADX
  const adx = calcADX(candles);
  signals.push({
    name: 'ADX (14)',
    value: adx.toFixed(1),
    signal: adx > 25 ? 'buy' : 'neutral',
    strength: adx,
    description: adx < 20 ? 'Weak trend' : adx < 40 ? 'Moderate trend' : 'Strong trend',
  });

  // 5. Stochastic
  const stoch = calcStochastic(candles);
  signals.push({
    name: 'Stochastic',
    value: stoch.k.toFixed(1),
    signal: stoch.k < 20 ? 'buy' : stoch.k > 80 ? 'sell' : 'neutral',
    strength: stoch.k < 20 || stoch.k > 80 ? 75 : 45,
    description: stoch.k < 20 ? 'Oversold zone' : stoch.k > 80 ? 'Overbought zone' : 'Neutral range',
  });

  // 6. Supertrend (simplified)
  const sma10 = calcSMA(closes, 10);
  const supertrend = current > sma10;
  signals.push({
    name: 'Supertrend',
    value: supertrend ? 'Buy Signal' : 'Sell Signal',
    signal: supertrend ? 'buy' : 'sell',
    strength: 65,
    description: supertrend ? 'Price above Supertrend — bullish' : 'Price below Supertrend — bearish',
  });

  // 7. SMA 20
  const sma20 = calcSMA(closes, 20);
  signals.push({
    name: 'SMA (20)',
    value: sma20.toFixed(2),
    signal: current > sma20 ? 'buy' : 'sell',
    strength: Math.min(80, Math.abs((current - sma20) / sma20) * 500 + 40),
    description: current > sma20 ? 'Price above 20-day SMA' : 'Price below 20-day SMA',
  });

  // 8. SMA 50
  const sma50 = calcSMA(closes, 50);
  signals.push({
    name: 'SMA (50)',
    value: sma50.toFixed(2),
    signal: current > sma50 ? 'buy' : 'sell',
    strength: Math.min(80, Math.abs((current - sma50) / sma50) * 500 + 40),
    description: current > sma50 ? 'Price above 50-day SMA' : 'Price below 50-day SMA',
  });

  // 9. SMA 200
  const sma200 = calcSMA(closes, 200);
  signals.push({
    name: 'SMA (200)',
    value: sma200.toFixed(2),
    signal: current > sma200 ? 'buy' : 'sell',
    strength: Math.min(85, Math.abs((current - sma200) / sma200) * 500 + 40),
    description: current > sma200 ? 'Long-term bullish trend' : 'Long-term bearish trend',
  });

  // 10. EMA 21
  const ema21 = calcEMA(closes, 21);
  signals.push({
    name: 'EMA (21)',
    value: ema21.toFixed(2),
    signal: current > ema21 ? 'buy' : 'sell',
    strength: 60,
    description: current > ema21 ? 'Short-term momentum positive' : 'Short-term momentum negative',
  });

  // 11. Volume trend
  const volumes = candles.map(c => c.volume);
  const avgVol = calcSMA(volumes, 20);
  const currentVol = volumes[volumes.length - 1] || 0;
  signals.push({
    name: 'Volume',
    value: currentVol > avgVol ? 'Above Avg' : 'Below Avg',
    signal: currentVol > avgVol * 1.2 ? 'buy' : currentVol < avgVol * 0.5 ? 'sell' : 'neutral',
    strength: 50,
    description: currentVol > avgVol ? 'High volume — conviction' : 'Low volume — caution',
  });

  // Tally
  const buyCount = signals.filter(s => s.signal === 'buy').length;
  const sellCount = signals.filter(s => s.signal === 'sell').length;
  const neutralCount = signals.filter(s => s.signal === 'neutral').length;

  const score = buyCount - sellCount;
  let overall: TechnicalSummary['overall'];
  let overallLabel: string;
  let overallColor: string;

  if (score >= 5) { overall = 'STRONG_BUY'; overallLabel = 'Strong Buy'; overallColor = '#10b981'; }
  else if (score >= 2) { overall = 'BUY'; overallLabel = 'Buy'; overallColor = '#34d399'; }
  else if (score >= -1) { overall = 'NEUTRAL'; overallLabel = 'Neutral'; overallColor = '#fbbf24'; }
  else if (score >= -4) { overall = 'SELL'; overallLabel = 'Sell'; overallColor = '#f87171'; }
  else { overall = 'STRONG_SELL'; overallLabel = 'Strong Sell'; overallColor = '#ef4444'; }

  return { signals, buyCount, sellCount, neutralCount, overall, overallLabel, overallColor };
}

// ─── Stock DNA Scores ────────────────────────────────────────────────────────

export function generateStockDNA(
  candles: Candle[],
  pe: number, roe: number, debtToEquity: number, pb: number,
  dividendYield: number
): StockDNAScores {
  const closes = candles.map(c => c.close);
  const rsi = calcRSI(closes);
  const macd = calcMACD(closes);

  // Momentum: RSI mapped + MACD direction
  const momentum = Math.min(100, Math.max(0,
    (rsi > 50 ? 50 + (rsi - 50) * 0.6 : rsi * 0.8) +
    (macd.histogram > 0 ? 20 : -10)
  ));

  // Fundamentals: ROE + low D/E
  const fundamentals = Math.min(100, Math.max(0,
    (roe > 0 ? Math.min(40, roe * 2) : 0) +
    (debtToEquity < 1 ? 30 : debtToEquity < 2 ? 15 : 5) +
    (pe > 0 && pe < 30 ? 25 : pe < 50 ? 15 : 5)
  ));

  // Value: low P/E + low P/B
  const value = Math.min(100, Math.max(0,
    (pe > 0 && pe < 15 ? 45 : pe < 25 ? 35 : pe < 40 ? 20 : 10) +
    (pb > 0 && pb < 2 ? 35 : pb < 5 ? 25 : 15) +
    (dividendYield > 2 ? 20 : dividendYield > 1 ? 15 : 5)
  ));

  // Growth: price momentum over time
  const priceGrowth = closes.length > 60
    ? ((closes[closes.length - 1] - closes[closes.length - 60]) / closes[closes.length - 60]) * 100
    : 5;
  const growth = Math.min(100, Math.max(0, 40 + priceGrowth * 1.5));

  // Volatility (inverted — lower = better)
  const returns = closes.slice(-30).map((c, i, arr) => i > 0 ? (c - arr[i-1]) / arr[i-1] : 0).slice(1);
  const stdDev = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length) * 100;
  const volatility = Math.min(100, Math.max(0, 100 - stdDev * 20));

  // Sentiment (mock — random-ish based on price trend)
  const recentTrend = closes.length > 5
    ? (closes[closes.length - 1] - closes[closes.length - 5]) / closes[closes.length - 5] * 100
    : 0;
  const sentiment = Math.min(100, Math.max(0, 50 + recentTrend * 10));

  return { momentum, fundamentals, value, growth, volatility, sentiment };
}

// Export individual calculators for use elsewhere
export { calcRSI, calcMACD, calcSMA, calcEMA, calcBollingerBands, calcStochastic, calcADX };
