'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Search, LineChart, Star, Bell, Settings,
  LogOut, TrendingUp, ChevronLeft, Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Toaster } from 'sonner';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/dashboard/analysis', label: 'Analysis', icon: LineChart },
  { href: '/dashboard/screener', label: 'Screener', icon: Search },
  { href: '/dashboard/watchlist', label: 'Watchlist', icon: Star },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialized, initialize, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Show loading while checking auth (only during initialization)
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-zinc-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] mesh-gradient flex">
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
        {/* Logo */}
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

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Theme */}
        <div className="p-3 border-t border-white/[0.03] space-y-2">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-1">
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
        <ThemeToggle />
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
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0a12] border-r border-white/[0.03]"
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
              <nav className="p-3 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'} mt-14 lg:mt-0`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
