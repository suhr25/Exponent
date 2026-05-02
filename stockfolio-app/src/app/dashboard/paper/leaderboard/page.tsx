'use client';
import { motion } from 'framer-motion';
export default function ComingSoonPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="glass-card rounded-xl p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🚀</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-sm text-zinc-500">This feature is being built and will be available shortly.</p>
      </div>
    </motion.div>
  );
}
