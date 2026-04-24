import type { EnrichedHolding } from '@/lib/store/usePortfolioStore';

export interface PortfolioInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
}

// Health Score: 0-100 based on diversification, returns, concentration
export function calculatePortfolioScore(holdings: EnrichedHolding[]): number {
  if (holdings.length === 0) return 0;

  let score = 50; // base

  // Diversification bonus (more stocks = better, up to 20pts)
  const diversityScore = Math.min(holdings.length / 8, 1) * 20;
  score += diversityScore;

  // Sector diversity (unique sectors / total, up to 15pts)
  const sectors = new Set(holdings.map(h => h.sector || 'Other'));
  const sectorScore = Math.min(sectors.size / 5, 1) * 15;
  score += sectorScore;

  // Positive returns bonus (up to 10pts)
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const returnsPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
  if (returnsPct > 0) score += Math.min(returnsPct / 2, 10);

  // Concentration penalty (if >40% in one stock, -10pts)
  const maxHoldingPct = Math.max(...holdings.map(h => (h.currentValue / totalValue) * 100));
  if (maxHoldingPct > 40) score -= 10;
  if (maxHoldingPct > 60) score -= 10;

  return Math.round(Math.max(0, Math.min(100, score)));
}

// Top/worst performers
export function getTopPerformers(holdings: EnrichedHolding[], n: number = 3): EnrichedHolding[] {
  return [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent).slice(0, n);
}

export function getWorstPerformers(holdings: EnrichedHolding[], n: number = 3): EnrichedHolding[] {
  return [...holdings].sort((a, b) => a.pnlPercent - b.pnlPercent).slice(0, n);
}

// Risk metrics
export function getConcentrationRisk(holdings: EnrichedHolding[]): { symbol: string; percentage: number }[] {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  return holdings
    .map(h => ({ symbol: h.symbol, percentage: total > 0 ? (h.currentValue / total) * 100 : 0 }))
    .sort((a, b) => b.percentage - a.percentage);
}

// HHI Index (Herfindahl–Hirschman Index) — measure of diversification
// < 1500 = diversified, 1500-2500 = moderate, > 2500 = concentrated
export function calculateHHI(holdings: EnrichedHolding[]): number {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (total === 0) return 0;
  return holdings.reduce((hhi, h) => {
    const share = (h.currentValue / total) * 100;
    return hhi + share * share;
  }, 0);
}

// Generate text insights
export function getPortfolioInsights(holdings: EnrichedHolding[]): PortfolioInsight[] {
  if (holdings.length === 0) return [];

  const insights: PortfolioInsight[] = [];
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const returnsPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  // Overall returns
  if (returnsPct > 10) {
    insights.push({
      type: 'success',
      title: 'Strong Returns',
      description: `Your portfolio is up ${returnsPct.toFixed(1)}%. Great performance!`,
    });
  } else if (returnsPct < -5) {
    insights.push({
      type: 'danger',
      title: 'Portfolio Down',
      description: `Your portfolio is down ${Math.abs(returnsPct).toFixed(1)}%. Consider reviewing your positions.`,
    });
  }

  // Concentration
  const concentration = getConcentrationRisk(holdings);
  if (concentration[0]?.percentage > 40) {
    insights.push({
      type: 'warning',
      title: 'High Concentration',
      description: `${concentration[0].symbol} makes up ${concentration[0].percentage.toFixed(0)}% of your portfolio. Consider diversifying.`,
    });
  }

  // Diversification
  const sectors = new Set(holdings.map(h => h.sector || 'Other'));
  if (sectors.size >= 4) {
    insights.push({
      type: 'success',
      title: 'Well Diversified',
      description: `Your portfolio spans ${sectors.size} sectors. Good diversification!`,
    });
  } else if (sectors.size <= 2) {
    insights.push({
      type: 'warning',
      title: 'Limited Sectors',
      description: `Only ${sectors.size} sector${sectors.size > 1 ? 's' : ''} in your portfolio. Consider adding more variety.`,
    });
  }

  // Top performer
  const top = getTopPerformers(holdings, 1)[0];
  if (top && top.pnlPercent > 5) {
    insights.push({
      type: 'info',
      title: 'Top Performer',
      description: `${top.symbol} is your best stock with +${top.pnlPercent.toFixed(1)}% returns.`,
    });
  }

  // Stock count
  if (holdings.length < 3) {
    insights.push({
      type: 'info',
      title: 'Small Portfolio',
      description: 'Consider adding more stocks for better risk distribution.',
    });
  }

  return insights;
}

// Generate mock portfolio history for chart
export function generatePortfolioHistory(totalInvested: number, days: number = 90): { date: string; value: number; invested: number }[] {
  const history: { date: string; value: number; invested: number }[] = [];
  const now = new Date();
  let value = totalInvested * 0.85;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const change = (Math.random() - 0.45) * totalInvested * 0.01;
    value = Math.max(totalInvested * 0.7, value + change);

    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      invested: totalInvested,
    });
  }

  return history;
}
