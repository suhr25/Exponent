'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Briefcase, Search, LineChart, Star, Bell, Settings,
  LogOut, TrendingUp, ChevronLeft, Menu, X, ChevronDown,
  Flame, Swords, ShieldAlert, Radio, Landmark, BarChart3,
  CalendarDays, Calculator, GraduationCap, Trophy, Globe2,
  BookOpen, ShoppingCart
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import MarketStatusBar from '@/components/shared/MarketStatusBar';
import GlobalSearch from '@/components/shared/GlobalSearch';
import { Toaster } from 'sonner';

// ─── Nav Structure ──────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
  badge?: string;
  dashed?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: Briefcase },
  {
    href: '/dashboard/analysis', label: 'Analysis', icon: LineChart,
    children: [
      { href: '/dashboard/analysis', label: 'Overview', icon: LineChart },
      { href: '/dashboard/analysis/heatmap', label: 'Heatmap', icon: Flame },
      { href: '/dashboard/analysis/battle', label: 'Stock Battle', icon: Swords },
      { href: '/dashboard/analysis/stress-test', label: 'Crash Simulator', icon: ShieldAlert },
      { href: '/dashboard/analysis/options', label: 'Options X-Ray', icon: Radio },
      { href: '/dashboard/analysis/ipo', label: 'IPO Radar', icon: Landmark },
      { href: '/dashboard/analysis/fii-dii', label: 'FII / DII', icon: BarChart3 },
      { href: '/dashboard/analysis/dividends', label: 'Dividends', icon: CalendarDays },
      { href: '/dashboard/analysis/tax', label: 'Tax Planner', icon: Calculator },
    ],
  },
  { href: '/dashboard/screener', label: 'Screener', icon: Search },
  { href: '/dashboard/stocks', label: 'All Stocks', icon: Globe2 },
  { href: '/dashboard/watchlist', label: 'Watchlist', icon: Star },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
];

const PAPER_NAV: NavItem[] = [
  { href: '/dashboard/paper', label: 'Paper Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/paper/trade', label: 'Trade', icon: ShoppingCart },
  { href: '/dashboard/paper/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/dashboard/paper/orders', label: 'Orders', icon: BookOpen },
  { href: '/dashboard/paper/learn', label: 'Learn', icon: GraduationCap },
  { href: '/dashboard/paper/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// ─── Sidebar Nav Item ───────────────────────────────────────────────────────

function SidebarItem({
  item, collapsed, pathname, onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = hasChildren
    ? pathname.startsWith(item.href)
    : pathname === item.href;

  // Auto-expand if child is active
  useEffect(() => {
    if (hasChildren && pathname.startsWith(item.href)) {
      setExpanded(true);
    }
  }, [pathname, item.href, hasChildren]);

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
        >
          {(() => { const Icon = item.icon; return <Icon className="w-[18px] h-[18px] flex-shrink-0" />; })()}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-3 pl-3 border-l border-white/[0.04]"
            >
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClick}
                  className={`sidebar-nav-item text-[13px] py-2 ${pathname === child.href ? 'active' : ''}`}
                >
                  {(() => { const Icon = child.icon; return <Icon className="w-[15px] h-[15px] flex-shrink-0" />; })()}
                  <span>{child.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      {(() => { const Icon = item.icon; return <Icon className="w-[18px] h-[18px] flex-shrink-0" />; })()}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, initialized, initialize } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    window.location.href = '/auth/signout';
  };

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center overflow-hidden">
        {/* Same orbs so loading → dashboard transition is seamless */}
        <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb orb-cyan w-[700px] h-[700px]" style={{ top: '-15%', left: '-8%' }} />
          <div className="orb orb-violet w-[600px] h-[600px]" style={{ top: '30%', right: '-12%' }} />
          <div className="orb orb-emerald w-[500px] h-[500px]" style={{ bottom: '-10%', left: '35%' }} />
        </div>
        <div className="relative flex flex-col items-center gap-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
            <svg className="w-5 h-5 text-[#050507]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '120ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      </div>
    );
  }

  const renderNav = (items: NavItem[], onClick?: () => void) =>
    items.map((item) => (
      <SidebarItem
        key={item.href}
        item={item}
        collapsed={collapsed}
        pathname={pathname}
        onClick={onClick}
      />
    ));

  return (
    <div className="min-h-screen bg-[#050507] flex">
      {/* Ambient animated background */}
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="orb orb-cyan  w-[700px] h-[700px]" style={{ top: '-15%', left: '-8%' }} />
        <div className="orb orb-violet w-[600px] h-[600px]" style={{ top: '30%', right: '-12%' }} />
        <div className="orb orb-emerald w-[500px] h-[500px]" style={{ bottom: '-10%', left: '35%' }} />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10,10,18,0.95)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#e4e4e7',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />

      {/* Sidebar — Desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } bg-[#0a0a12]/95 backdrop-blur-xl border-r border-white/[0.03]`}
      >
        {/* Logo + Market Status */}
        <div className="flex items-center justify-between h-[64px] px-4 border-b border-white/[0.03]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/15 flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-[#050507]" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-extrabold tracking-tight"
              >
                Exponent
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-zinc-600 hover:text-zinc-300 transition-all"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Market Status + Search (below logo) */}
        {!collapsed && (
          <div className="px-3 py-2.5 space-y-2 border-b border-white/[0.03]">
            <MarketStatusBar />
            <GlobalSearch />
          </div>
        )}

        {/* Main Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {renderNav(MAIN_NAV)}

          {/* Paper Trading Section */}
          {!collapsed && (
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <div className="px-3 mb-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.15em]">
                  Paper Trade
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-semibold">
                  Virtual
                </span>
              </div>
              <div className="space-y-0.5 rounded-xl border border-dashed border-emerald-500/10 p-1.5">
                {renderNav(PAPER_NAV)}
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-0.5">
              {renderNav(PAPER_NAV)}
            </div>
          )}
        </nav>

        {/* Bottom: Settings + User + Theme */}
        <div className="p-3 border-t border-white/[0.03] space-y-1">
          {renderNav(BOTTOM_NAV)}

          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1">
              <ThemeToggle />
            </div>
          )}

          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-xs font-bold text-[#050507] flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-200 truncate">{user.name}</div>
                <div className="text-[11px] text-zinc-600 truncate">{user.email}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`sidebar-nav-item text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] w-full ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 glass flex items-center justify-between px-4 border-b border-white/[0.03]">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-zinc-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#050507]" />
          </div>
          <span className="text-base font-extrabold">Exponent</span>
        </Link>
        <GlobalSearch />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0a12] border-r border-white/[0.03] overflow-y-auto"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.03]">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#050507]" />
                  </div>
                  <span className="text-lg font-extrabold">Exponent</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-3 py-2.5">
                <MarketStatusBar />
              </div>

              <nav className="p-3 space-y-0.5">
                {renderNav(MAIN_NAV, () => setMobileOpen(false))}

                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.15em]">
                      Paper Trade
                    </span>
                  </div>
                  <div className="space-y-0.5 rounded-xl border border-dashed border-emerald-500/10 p-1.5">
                    {renderNav(PAPER_NAV, () => setMobileOpen(false))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  {renderNav(BOTTOM_NAV, () => setMobileOpen(false))}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'} mt-14 lg:mt-0`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
