'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Info, Wallet } from 'lucide-react';
import { usePaperTradeStore, OrderSide, OrderType, ProductType } from '@/lib/store/usePaperTradeStore';
import { formatCurrency } from '@/lib/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

export default function OrderPad({ isOpen, onClose, symbol, currentPrice }: Props) {
  const { balance, usedMargin, placeOrder } = usePaperTradeStore();
  const [side, setSide] = useState<OrderSide>('BUY');
  const [type, setType] = useState<OrderType>('MARKET');
  const [product, setProduct] = useState<ProductType>('DELIVERY');
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [error, setError] = useState<string | null>(null);

  const availableMargin = balance - usedMargin;
  const numQuantity = parseInt(quantity) || 0;
  const numPrice = parseFloat(price) || currentPrice;
  
  const marginRequired = side === 'BUY' 
    ? (type === 'MARKET' ? currentPrice : numPrice) * numQuantity * (product === 'INTRADAY' ? 0.2 : 1)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (type === 'LIMIT' && numPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (side === 'BUY' && marginRequired > availableMargin) {
      setError('Insufficient margin available');
      return;
    }

    const result = placeOrder(
      {
        symbol,
        side,
        type,
        product,
        quantity: numQuantity,
        price: numPrice,
      },
      currentPrice
    );

    if (result.success) {
      onClose();
      // Optional: Add toast notification here
    } else {
      setError(result.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:top-4 md:bottom-4 md:right-4 md:w-[400px] bg-[#0c0c14] border border-white/[0.08] rounded-t-2xl md:rounded-2xl z-[100] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className={`p-4 border-b border-white/[0.04] flex items-center justify-between ${side === 'BUY' ? 'bg-emerald-500/[0.02]' : 'bg-red-500/[0.02]'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {side}
                  </span>
                  <h2 className="text-lg font-bold text-white">{symbol}</h2>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">NSE</span>
                </div>
                <div className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                  {formatCurrency(currentPrice)}
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Buy/Sell Toggle */}
              <div className="flex bg-white/[0.02] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${side === 'BUY' ? 'bg-emerald-500 text-[#050507] shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${side === 'SELL' ? 'bg-red-500 text-[#050507] shadow-lg shadow-red-500/20' : 'text-zinc-400 hover:text-white'}`}
                >
                  SELL
                </button>
              </div>

              {/* Product Type */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product</label>
                  <Info className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProduct('DELIVERY')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${product === 'DELIVERY' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:border-white/10'}`}
                  >
                    Delivery (CNC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProduct('INTRADAY')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${product === 'INTRADAY' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:border-white/10'}`}
                  >
                    Intraday (MIS)
                  </button>
                </div>
              </div>

              {/* Order Type */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Type</label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('MARKET')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all border ${type === 'MARKET' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/[0.05] text-zinc-500 hover:border-white/10'}`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('LIMIT')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all border ${type === 'LIMIT' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/[0.05] text-zinc-500 hover:border-white/10'}`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500">Qty</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-cyan-500/50 focus:outline-none transition-colors"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500">Price</label>
                  <input
                    type="number"
                    value={type === 'MARKET' ? currentPrice : price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={type === 'MARKET'}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-cyan-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    step="0.05"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </form>

            {/* Footer / Submit */}
            <div className="p-5 border-t border-white/[0.04] bg-[#0c0c14] md:rounded-b-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs">Margin Required</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatCurrency(marginRequired)}</div>
                  <div className="text-[10px] text-zinc-500">Available: {formatCurrency(availableMargin)}</div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className={`w-full py-4 rounded-xl font-bold text-lg text-[#050507] transition-all flex items-center justify-center gap-2 ${
                  side === 'BUY' 
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-red-500 hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                }`}
              >
                {side === 'BUY' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {side} {symbol}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
