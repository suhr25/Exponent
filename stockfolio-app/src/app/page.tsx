'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Navbar = dynamic(() => import('@/components/landing/Navbar'), { ssr: false });
const Hero = dynamic(() => import('@/components/landing/Hero'), { ssr: false });
const Features = dynamic(() => import('@/components/landing/Hero').then(m => ({ default: m.Features })), { ssr: false });

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050507] noise-overlay">
      <Navbar />
      <Hero />
      <Features />

      {/* CTA Section */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.05), transparent 60%)'
        }} />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
              Ready to Level Up<br />
              <span className="gradient-text">Your Investments?</span>
            </h2>
            <p className="text-zinc-500 text-base mb-10 max-w-lg mx-auto leading-relaxed">
              Join thousands of Indian investors using Exponent to make smarter, data-driven investment decisions.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-base rounded-2xl btn-primary-glow group"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.03] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#050507]" />
              </div>
              <span className="text-sm font-bold">Exponent<span className="gradient-text"></span></span>
            </div>
            <div className="text-xs text-zinc-600">
              © 2026 Exponent. Built with precision for Indian investors.
            </div>
            <div className="flex gap-6 text-xs text-zinc-600">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
