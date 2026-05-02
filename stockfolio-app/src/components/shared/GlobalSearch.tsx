'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useStocksStore, type BseStock } from '@/lib/store/useStocksStore';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BseStock[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { searchStocks, recentSearches, addRecentSearch, getStock } = useStocksStore();

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search as user types
  useEffect(() => {
    if (query.length >= 1) {
      const found = searchStocks(query);
      setResults(found.slice(0, 8));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, searchStocks]);

  const navigateToStock = useCallback((symbol: string) => {
    addRecentSearch(symbol);
    setIsOpen(false);
    router.push(`/dashboard/stock/${symbol}`);
  }, [addRecentSearch, router]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : recentSearches.map(sym => getStock(sym)).filter(Boolean) as BseStock[];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && items[selectedIndex]) {
      navigateToStock(items[selectedIndex].sym);
    }
  };

  const displayItems = results.length > 0
    ? results
    : recentSearches.map(sym => getStock(sym)).filter(Boolean) as BseStock[];

  const showRecent = query.length === 0 && recentSearches.length > 0;

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-300 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Search stocks...</span>
        <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-600 font-mono border border-white/[0.06]">
          ⌘K
        </kbd>
      </button>

      {/* Full-screen Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Search Modal */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
            >
              <div className="mx-4 rounded-2xl bg-[#0e0e18] border border-white/[0.06] shadow-2xl shadow-black/50 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
                  <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search stocks by name, symbol, or sector..."
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-[10px] px-2 py-1 rounded bg-white/[0.05] text-zinc-500 font-mono border border-white/[0.06]">
                    ESC
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[360px] overflow-y-auto">
                  {showRecent && (
                    <div className="px-5 pt-3 pb-1">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Recent Searches
                      </span>
                    </div>
                  )}

                  {query.length > 0 && results.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-zinc-500">No stocks found for &ldquo;{query}&rdquo;</p>
                    </div>
                  )}

                  {displayItems.map((stock, index) => (
                    <button
                      key={stock.sym}
                      onClick={() => navigateToStock(stock.sym)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-cyan-500/[0.06] border-l-2 border-cyan-400'
                          : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-cyan-400/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{stock.sym}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 font-medium">
                            {stock.mcap === 'large' ? 'Large Cap' : stock.mcap === 'mid' ? 'Mid Cap' : 'Small Cap'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate">{stock.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] text-zinc-600">{stock.sector}</div>
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/[0.04] text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.04] font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.04] font-mono">↵</kbd> Open</span>
                  <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.04] font-mono">esc</kbd> Close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
