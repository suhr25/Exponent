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
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.09] transition-all group"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs flex-1 text-left truncate min-w-0">Search stocks...</span>
        <kbd className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-600 font-mono border border-white/[0.06]">
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
                <div className="flex items-center gap-4 px-5 py-4.5 border-b border-white/[0.04] bg-white/[0.01]">
                  <Search className="w-5 h-5 text-cyan-500/70 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search stocks by name, symbol, or sector..."
                    className="flex-1 bg-transparent text-white text-base placeholder:text-zinc-600 outline-none"
                  />
                  <div className="flex items-center gap-2">
                    {query && (
                      <button 
                        onClick={() => setQuery('')} 
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="text-[10px] px-2 py-1.5 rounded-lg bg-white/[0.05] text-zinc-500 font-mono border border-white/[0.06] hover:bg-white/[0.1] transition-colors"
                    >
                      ESC
                    </button>
                  </div>
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
                      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all ${
                        index === selectedIndex
                          ? 'bg-cyan-500/[0.07] border-l-2 border-cyan-400'
                          : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        index === selectedIndex ? 'bg-cyan-500/20' : 'bg-white/[0.04]'
                      }`}>
                        <TrendingUp className={`w-5 h-5 ${index === selectedIndex ? 'text-cyan-400' : 'text-zinc-500'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-white tracking-tight">{stock.sym}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 font-bold uppercase tracking-wider border border-white/[0.03]">
                            {stock.mcap === 'large' ? 'Large Cap' : stock.mcap === 'mid' ? 'Mid Cap' : 'Small Cap'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate font-medium">{stock.name}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-zinc-500 font-semibold border border-white/[0.05]">
                          {stock.sector}
                        </span>
                        {index === selectedIndex && (
                          <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                            <ArrowRight className="w-4 h-4 text-cyan-400" />
                          </motion.div>
                        )}
                      </div>
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
