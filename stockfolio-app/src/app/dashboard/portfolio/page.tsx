'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Download, Briefcase } from 'lucide-react';
import { usePortfolioStore, type EnrichedHolding } from '@/lib/store/usePortfolioStore';
import { formatCurrency, formatPercent, formatCurrencyCompact, getChangeColor, getChangeBg } from '@/lib/utils/formatters';
import { SkeletonStats, SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import AddStockModal from '@/components/portfolio/AddStockModal';
import EditStockModal from '@/components/portfolio/EditStockModal';
import DeleteConfirmDialog from '@/components/portfolio/DeleteConfirmDialog';

export default function PortfolioPage() {
  const { holdings, isLoading, fetchHoldings, totalInvested, currentValue, totalPnl, totalPnlPercent, sectorAllocation } = usePortfolioStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnrichedHolding | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedHolding | null>(null);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const handleExportCSV = () => {
    const headers = 'Symbol,Company,Qty,Buy Price,LTP,Invested,Current,P&L,Returns%\n';
    const rows = holdings.map(h =>
      `${h.symbol},${h.company_name},${h.quantity},${h.buy_price},${h.ltp},${h.invested},${h.currentValue},${h.pnl},${h.pnlPercent.toFixed(2)}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <SkeletonTable rows={6} cols={7} />
      </div>
    );
  }

  const invested = totalInvested();
  const value = currentValue();
  const pnl = totalPnl();
  const pnlPct = totalPnlPercent();
  const sectors = sectorAllocation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Portfolio</h1>
          <p className="text-sm text-zinc-500 mt-1">{holdings.length} holdings in your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          {holdings.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-xs font-semibold text-zinc-400 hover:text-white transition-all border border-white/[0.04]"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-glow text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={<Briefcase className="w-7 h-7 text-cyan-400/50" />}
            title="Your Portfolio is Empty"
            description="Start building your portfolio by adding stocks. Track your investments, view P&L, and get insights."
            action={{ label: 'Add Your First Stock', onClick: () => setAddOpen(true) }}
          />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-5 border-l-2 border-cyan-400/30">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Invested</div>
              <div className="text-xl font-extrabold text-cyan-400 font-mono-num">{formatCurrencyCompact(invested)}</div>
            </div>
            <div className="glass-card rounded-xl p-5 border-l-2 border-emerald-400/30">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Value</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono-num">{formatCurrencyCompact(value)}</div>
            </div>
            <div className="glass-card rounded-xl p-5 border-l-2" style={{ borderColor: pnl >= 0 ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)' }}>
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Total P&L</div>
              <div className={`text-xl font-extrabold font-mono-num ${getChangeColor(pnl)}`}>
                {pnl >= 0 ? '+' : ''}{formatCurrencyCompact(pnl)}
              </div>
              <div className={`text-xs font-semibold ${getChangeColor(pnlPct)}`}>{formatPercent(pnlPct)}</div>
            </div>
            <div className="glass-card rounded-xl p-5 border-l-2 border-violet-400/30">
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Holdings</div>
              <div className="text-xl font-extrabold text-violet-400 font-mono-num">{holdings.length}</div>
              <div className="text-xs text-zinc-600">{sectors.length} sectors</div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.03]">
              <h3 className="text-sm font-bold text-zinc-200">Holdings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Buy Price</th>
                    <th className="text-right">LTP</th>
                    <th className="text-right">Invested</th>
                    <th className="text-right">Current</th>
                    <th className="text-right">P&L</th>
                    <th className="text-right">Returns</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.id} className="group">
                      <td>
                        <Link href={`/dashboard/stock/${h.symbol}`} className="hover:text-cyan-400 transition-colors">
                          <div className="font-semibold text-zinc-100">{h.symbol}</div>
                          <div className="text-[11px] text-zinc-600 truncate max-w-[120px]">{h.company_name}</div>
                        </Link>
                      </td>
                      <td className="text-right font-mono-num">{h.quantity}</td>
                      <td className="text-right font-mono-num text-zinc-400">{formatCurrency(h.buy_price)}</td>
                      <td className="text-right font-semibold font-mono-num text-zinc-200">{formatCurrency(h.ltp)}</td>
                      <td className="text-right font-mono-num text-zinc-400">{formatCurrency(h.invested)}</td>
                      <td className="text-right font-semibold font-mono-num">{formatCurrency(h.currentValue)}</td>
                      <td className={`text-right font-semibold font-mono-num ${getChangeColor(h.pnl)}`}>
                        {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                      </td>
                      <td className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono-num ${getChangeBg(h.pnlPercent)}`}>
                          {formatPercent(h.pnlPercent)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTarget(h)}
                            className="p-2 rounded-lg hover:bg-white/[0.05] text-zinc-500 hover:text-cyan-400 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(h)}
                            className="p-2 rounded-lg hover:bg-red-500/[0.06] text-zinc-500 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Breakdown */}
          {sectors.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-zinc-200 mb-4">Sector Breakdown</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sectors.map((s) => (
                  <div key={s.sector} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm text-zinc-300">{s.sector}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono-num">{s.percentage.toFixed(1)}%</div>
                      <div className="text-[11px] text-zinc-600 font-mono-num">{formatCurrencyCompact(s.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddStockModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditStockModal open={!!editTarget} onClose={() => setEditTarget(null)} holding={editTarget} />
      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} holding={deleteTarget} />
    </motion.div>
  );
}
