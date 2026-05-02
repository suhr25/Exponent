'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Copy, Check, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Props {
  stockSymbol: string;
  companyName: string;
  systemPrompt: string;
  preBuiltQuestions?: string[];
}

export default function AIChat({ stockSymbol, companyName, systemPrompt, preBuiltQuestions }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultChips = preBuiltQuestions || [
    'Is this a good buy now?',
    'Explain the recent price movement',
    'What are the key risks?',
    'Give me a 6-month outlook',
    'Compare with sector peers',
    'Explain the technicals',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: content.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt,
          maxTokens: 600,
        }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || 'Sorry, I could not generate a response.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to connect to AI service. Please try again later.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050507] font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 20px rgba(0,212,170,0.2)', '0 0 40px rgba(0,212,170,0.3)', '0 0 20px rgba(0,212,170,0.2)'] }}
        transition={{ boxShadow: { repeat: Infinity, duration: 3 } }}
      >
        <Sparkles className="w-4 h-4" />
        Ask AI
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[81] w-full sm:w-[400px] bg-[#0a0a12] border-l border-white/[0.06] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#050507]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">AI Analyst</div>
                    <div className="text-[10px] text-zinc-500">{stockSymbol} · {companyName}</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-cyan-400/30 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500 mb-4">Ask me anything about {stockSymbol}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {defaultChips.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 hover:text-white hover:border-cyan-500/20 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/10 border border-cyan-500/15 text-white'
                        : 'bg-white/[0.03] border border-white/[0.04] text-zinc-300'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyMessage(i, msg.content)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400"
                        >
                          {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === i ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Disclaimer */}
              <div className="px-5 py-1.5 text-center">
                <p className="text-[9px] text-zinc-600">AI analysis is not financial advice. DYOR.</p>
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder={`Ask about ${stockSymbol}...`}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
