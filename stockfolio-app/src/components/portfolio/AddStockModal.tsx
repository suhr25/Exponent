'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { usePortfolioStore } from '@/lib/store/usePortfolioStore';
import { MOCK_QUOTES } from '@/lib/utils/mock-data';
import { toast } from 'sonner';

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddStockModal({ open, onClose }: AddStockModalProps) {
  const { addHolding } = usePortfolioStore();
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; companyName: string; sector?: string } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return MOCK_QUOTES.filter(
      s => s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search]);

  const resetForm = () => {
    setSearch('');
    setSelectedStock(null);
    setQuantity('');
    setBuyPrice('');
    setShowDropdown(false);
  };

  const handleSelect = (stock: typeof MOCK_QUOTES[0]) => {
    setSelectedStock({ symbol: stock.symbol, companyName: stock.companyName, sector: stock.sector });
    setSearch(stock.symbol);
    setBuyPrice(stock.ltp.toString());
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity || !buyPrice) return;

    setSubmitting(true);
    const result = await addHolding({
      symbol: selectedStock.symbol,
      company_name: selectedStock.companyName,
      quantity: parseInt(quantity),
      buy_price: parseFloat(buyPrice),
      sector: selectedStock.sector,
    });

    setSubmitting(false);

    if (result.error) {
      toast.error(`Failed to add stock: ${result.error}`);
    } else {
      toast.success(`${selectedStock.symbol} added to your portfolio`);
      resetForm();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} title="Add Stock" description="Search for a stock and add it to your portfolio">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stock Search */}
        <div className="relative">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Stock</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); setSelectedStock(null); }}
              onFocus={() => search && setShowDropdown(true)}
              placeholder="Search by symbol or name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none"
              autoComplete="off"
            />
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showDropdown && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 w-full mt-1 bg-[#0a0a12] border border-white/[0.06] rounded-xl shadow-xl overflow-hidden"
              >
                {filtered.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => handleSelect(stock)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{stock.symbol}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{stock.companyName}</div>
                    </div>
                    <div className="text-sm font-mono-num text-zinc-400">₹{stock.ltp.toLocaleString('en-IN')}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedStock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10"
            >
              <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-cyan-400">{selectedStock.symbol}</span>
              <span className="text-xs text-zinc-500">— {selectedStock.companyName}</span>
            </motion.div>
          )}
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              min="1"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none font-mono-num"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Buy Price (₹)</label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="e.g. 2450.00"
              min="0.01"
              step="0.01"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all outline-none font-mono-num"
            />
          </div>
        </div>

        {/* Preview */}
        {selectedStock && quantity && buyPrice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="text-xs text-zinc-500 mb-2">Investment Preview</div>
            <div className="text-lg font-bold text-cyan-400 font-mono-num">
              ₹{(parseInt(quantity) * parseFloat(buyPrice)).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-zinc-600 mt-0.5">
              {quantity} shares × ₹{parseFloat(buyPrice).toLocaleString('en-IN')}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="flex-1 px-4 py-3 rounded-xl border border-white/[0.06] text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedStock || !quantity || !buyPrice || submitting}
            className="flex-1 px-4 py-3 rounded-xl btn-primary-glow text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Stock
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
