'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { usePaperTradeStore } from '@/lib/store/usePaperTradeStore';
import { formatCurrency } from '@/lib/utils/formatters';
import { format } from 'date-fns';

export default function PaperOrdersPage() {
  const { orders, cancelOrder } = usePaperTradeStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXECUTED': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-zinc-500" />;
      case 'REJECTED': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/paper" className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order History</h1>
          <p className="text-sm text-zinc-500 mt-1">Virtual trades and pending orders</p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 mb-4">No orders placed yet.</p>
            <Link href="/dashboard/screener" className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors">
              Find Stocks to Trade
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-zinc-400 text-xs">
                      {format(new Date(o.timestamp), 'dd MMM, HH:mm:ss')}
                    </td>
                    <td>
                      <Link href={`/dashboard/stock/${o.symbol}`} className="font-bold text-white hover:text-cyan-400">
                        {o.symbol}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${o.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {o.side}
                        </span>
                        <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded border border-white/10">
                          {o.type}
                        </span>
                        <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded border border-white/10">
                          {o.product}
                        </span>
                      </div>
                    </td>
                    <td className="text-right font-mono">{o.quantity}</td>
                    <td className="text-right font-mono">{formatCurrency(o.price)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {getStatusIcon(o.status)}
                        <span className={`text-xs font-semibold ${
                          o.status === 'EXECUTED' ? 'text-emerald-400' : 
                          o.status === 'PENDING' ? 'text-amber-400' : 
                          o.status === 'REJECTED' ? 'text-red-400' : 'text-zinc-500'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      {o.reason && <div className="text-[10px] text-red-400/80 mt-1 max-w-[150px] truncate ml-auto" title={o.reason}>{o.reason}</div>}
                    </td>
                    <td className="text-right">
                      {o.status === 'PENDING' && (
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
