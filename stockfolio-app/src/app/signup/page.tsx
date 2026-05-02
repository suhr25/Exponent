'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Check, Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

type Tab = 'email' | 'phone';
type PhoneStep = 'number' | 'otp';

export default function SignupPage() {
  const { signupWithEmail, loginWithGoogle, loginWithPhone, verifyOtp, error, clearError } = useAuthStore();

  const [tab, setTab] = useState<Tab>('email');

  // Email state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const passwordChecks = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains lowercase', met: /[a-z]/.test(password) },
  ];
  const allChecksMet = passwordChecks.every(c => c.met);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSigningUp(true);
    const result = await signupWithEmail(name, email, password);
    if (result.error) { setSigningUp(false); return; }
    if (result.needsConfirmation) { setConfirmationSent(true); setSigningUp(false); return; }
    window.location.href = '/dashboard';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSendingOtp(true);
    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    const result = await loginWithPhone(fullPhone);
    setSendingOtp(false);
    if (!result.error) setPhoneStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setVerifying(true);
    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    const result = await verifyOtp(fullPhone, otp);
    setVerifying(false);
    if (!result.error) window.location.href = '/dashboard';
  };

  const switchTab = (t: Tab) => { clearError(); setTab(t); setPhoneStep('number'); };

  // Email confirmation screen
  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
        <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="orb orb-emerald w-[600px] h-[600px]" style={{ top: '-10%', right: '-5%' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="relative w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              We&apos;ve sent a confirmation link to <strong className="text-zinc-200">{email}</strong>.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-zinc-500 mb-6">
              Check your spam folder if you don&apos;t see it within a few minutes.
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary-glow text-sm font-bold">
              Go to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-emerald w-[600px] h-[600px]" style={{ top: '-10%', right: '-5%' }} />
        <div className="orb orb-violet w-[500px] h-[500px]" style={{ bottom: '-5%', left: '-8%' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass-card rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#050507]" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-xl font-extrabold">Exponent</span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-7">Start tracking your investments for free</p>

          {/* Google */}
          <button onClick={() => loginWithGoogle()} type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] text-sm font-semibold hover:bg-white/[0.04] active:scale-[0.98] transition-all mb-5">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04] mb-6">
            {(['email', 'phone'] as Tab[]).map((t) => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white/[0.07] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}>
                {t === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                {t === 'email' ? 'Email' : 'Phone'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ── Email tab ── */}
            {tab === 'email' && (
              <motion.form key="email"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="John Doe" required disabled={signingUp}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required disabled={signingUp}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6} disabled={signingUp}
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-1.5">
                      {passwordChecks.map(c => (
                        <div key={c.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${c.met ? 'bg-emerald-500/20' : 'bg-white/[0.04]'}`}>
                            {c.met && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                          </div>
                          <span className={`text-xs ${c.met ? 'text-emerald-400' : 'text-zinc-600'}`}>{c.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
                <button type="submit" disabled={signingUp || !allChecksMet || !name || !email}
                  className="w-full py-3 rounded-xl btn-primary-glow text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                  {signingUp ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : 'Create Account'}
                </button>
              </motion.form>
            )}

            {/* ── Phone tab ── */}
            {tab === 'phone' && (
              <motion.div key="phone"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}>
                <AnimatePresence mode="wait">
                  {phoneStep === 'number' && (
                    <motion.form key="number"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-400 font-semibold whitespace-nowrap">
                            🇮🇳 +91
                          </div>
                          <input type="tel" value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="98765 43210" required maxLength={10} disabled={sendingOtp}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-sm outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all font-mono-num tracking-wider" />
                        </div>
                        <p className="text-xs text-zinc-600 mt-2">We&apos;ll send a 6-digit OTP to this number</p>
                      </div>
                      <button type="submit" disabled={sendingOtp || phone.length < 10}
                        className="w-full py-3 rounded-xl btn-primary-glow text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                        {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Sending OTP...</> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </motion.form>
                  )}
                  {phoneStep === 'otp' && (
                    <motion.form key="otp"
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                        OTP sent to +91 {phone}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Enter OTP</label>
                        <input type="text" value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="• • • • • •" required maxLength={6} disabled={verifying} autoFocus
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50 transition-all font-mono-num" />
                      </div>
                      <button type="submit" disabled={verifying || otp.length < 6}
                        className="w-full py-3 rounded-xl btn-primary-glow text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all">
                        {verifying ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : 'Verify & Create Account'}
                      </button>
                      <button type="button" onClick={() => { setPhoneStep('number'); setOtp(''); clearError(); }}
                        className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1">
                        ← Change number
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-zinc-500 text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
