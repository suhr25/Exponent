'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { usePortfolioStore, type EnrichedHolding } from '@/lib/store/usePortfolioStore';
import { toast } from 'sonner';

interface EditStockModalProps {
  open: boolean;
  onClose: () => void;
  holding: EnrichedHolding | null;
}

export default function EditStockModal({ open, onClose, holding }: EditStockModalProps) {
  const { updateHolding } = usePortfolioStore();
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (holding) {
      setQuantity(holding.quantity.toString());
      setBuyPrice(holding.buy_price.toString());
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;

    setSubmitting(true);
    const result = await updateHolding(holding.id, {
      quantity: parseInt(quantity),
      buy_price: parseFloat(buyPrice),
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(`Failed to update: ${result.error}`);
    } else {
      toast.success(`${holding.symbol} updated successfully`);
      onClose();
    }
  };

  if (!holding) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${holding.symbol}`} description={holding.company_name}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm transition-all outline-none font-mono-num focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Buy Price (₹)</label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm transition-all outline-none font-mono-num focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/[0.06] text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-xl btn-primary-glow text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
