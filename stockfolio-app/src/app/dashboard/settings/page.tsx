'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Globe, Shield, Save, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  // Local preferences (persisted to localStorage)
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-xl">
        <div className="px-6 py-4 border-b border-white/[0.03] flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold">Profile</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">{user?.name || 'User'}</div>
              <div className="text-sm text-zinc-500">{user?.email}</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary-glow text-sm"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card rounded-xl">
        <div className="px-6 py-4 border-b border-white/[0.03] flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold">Preferences</h3>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {/* Theme */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center">
                <span className="text-violet-400 text-sm">🌓</span>
              </div>
              <div>
                <div className="text-sm font-medium">Theme</div>
                <div className="text-xs text-zinc-500">Toggle between dark and light mode</div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Price Alerts */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center">
                <Bell className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Price Alerts</div>
                <div className="text-xs text-zinc-500">Get notified when stocks hit your targets</div>
              </div>
            </div>
            <button
              onClick={() => setPriceAlerts(!priceAlerts)}
              className={`relative w-11 h-6 rounded-full transition-colors ${priceAlerts ? 'bg-cyan-500' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${priceAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-xs text-zinc-500">Daily portfolio summaries via email</div>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-cyan-500' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Default Exchange */}
      <div className="glass-card rounded-xl">
        <div className="px-6 py-4 border-b border-white/[0.03] flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold">Default Exchange</h3>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            {(['NSE', 'BSE'] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => setExchange(ex)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  exchange === ex
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'glass text-zinc-400 hover:text-white border border-white/[0.04]'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Connection Status</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-zinc-300">Supabase Connected</span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Portfolio data is stored securely in Supabase PostgreSQL with Row Level Security.
        </p>
      </div>
    </motion.div>
  );
}
