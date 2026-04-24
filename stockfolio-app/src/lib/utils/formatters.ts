// ─── Currency & Number Formatters ────────────────────────────────────────────

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INR_COMPACT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const NUM = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return INR.format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1e7) {
    return `₹${(value / 1e7).toFixed(2)} Cr`;
  }
  if (Math.abs(value) >= 1e5) {
    return `₹${(value / 1e5).toFixed(2)} L`;
  }
  return INR_COMPACT.format(value);
}

export function formatNumber(value: number): string {
  return NUM.format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
}

export function formatVolume(value: number): string {
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)} K`;
  return value.toString();
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)} T`;
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return formatCurrency(value);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-zinc-400';
}

export function getChangeBg(value: number): string {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (value < 0) return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
