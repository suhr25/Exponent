'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { usePortfolioStore, type EnrichedHolding } from '@/lib/store/usePortfolioStore';
import { toast } from 'sonner';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  holding: EnrichedHolding | null;
}

export default function DeleteConfirmDialog({ open, onClose, holding }: DeleteConfirmDialogProps) {
  const { deleteHolding } = usePortfolioStore();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!holding) return;

    setDeleting(true);
    const result = await deleteHolding(holding.id);
    setDeleting(false);

    if (result.error) {
      toast.error(`Failed to delete: ${result.error}`);
    } else {
      toast.success(`${holding.symbol} removed from portfolio`);
      onClose();
    }
  };

  if (!holding) return null;

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-bold mb-2">Delete {holding.symbol}?</h3>
        <p className="text-sm text-zinc-500 mb-6">
          This will permanently remove <strong>{holding.company_name}</strong> ({holding.quantity} shares) from your portfolio. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/[0.06] text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
