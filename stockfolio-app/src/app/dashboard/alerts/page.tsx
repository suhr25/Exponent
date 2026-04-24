'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Trash2, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { NIFTY_50_STOCKS } from '@/lib/utils/constants';
import { formatCurrency, timeAgo } from '@/lib/utils/formatters';

export default function AlertsPage() {
  const { alerts, createAlert, deleteAlert, toggleAlert } = useWatchlistStore();
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [value, setValue] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !value) return;
    createAlert({
      symbol: symbol.toUpperCase(),
      condition,
      value: parseFloat(value),
      active: true,
    });
    setSymbol('');
    setValue('');
    setShowForm(false);
  };

  const activeAlerts = alerts.filter(a => a.active);
  const inactiveAlerts = alerts.filter(a => !a.active);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Alerts</h1>
          <p className="text-sm text-zinc-500 mt-1">Get notified when stocks hit your target</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={handleCreate} className="glass-card rounded-xl p-6">
              <h3 className="text-base font-semibold mb-4">Create New Alert</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Stock Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., RELIANCE"
                    required
                    list="stock-symbols"
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
                  />
                  <datalist id="stock-symbols">
                    {NIFTY_50_STOCKS.map(s => <option key={s.symbol} value={s.symbol} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
                  >
                    <option value="above">Price Above</option>
                    <option value="below">Price Below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Price (₹)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-surface-700 border border-zinc-800 text-sm text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold"
              >
                Create Alert
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alerts */}
      {alerts.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No alerts set</h3>
          <p className="text-sm text-zinc-500 mb-6">Create price alerts to get notified</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <>
          {activeAlerts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Active ({activeAlerts.length})
              </h3>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <BellRing className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-semibold">{alert.symbol}</div>
                        <div className="text-xs text-zinc-500">
                          Price {alert.condition} {formatCurrency(alert.value)} · Created {timeAgo(alert.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <ToggleRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {inactiveAlerts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Paused ({inactiveAlerts.length})
              </h3>
              <div className="space-y-2">
                {inactiveAlerts.map((alert) => (
                  <div key={alert.id} className="glass-card rounded-xl p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <div className="font-semibold">{alert.symbol}</div>
                        <div className="text-xs text-zinc-500">
                          Price {alert.condition} {formatCurrency(alert.value)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className="p-2 text-zinc-500 hover:text-emerald-400 rounded-lg transition-colors"
                      >
                        <ToggleLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
