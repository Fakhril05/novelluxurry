'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

const BOT_REPLIES: Record<string, string[]> = {
  id: {
    'hai|halo|hello|hi': 'Halo! \ud83d\udc4b Selamat datang di Noveluxe. Ada yang bisa saya bantu?',
    'promo|diskon|voucher': 'Kami punya promo spesial! Gunakan kode WELCOME10 untuk diskon 10% untuk pembelian pertama.',
    'pengiriman|kirim|ongkir': 'Kami menggunakan JNE dengan estimasi 1-5 hari kerja. Ongkir mulai dari Rp15.000.',
    'bayar|payment|pembayaran': 'Kami menerima Transfer Bank, QRIS, E-Wallet, Virtual Account, dan COD.',
    'return|retur|kembali': 'Pengembalian bisa dilakukan dalam 7 hari setelah penerimaan jika buku dalam kondisi rusak.',
    'default': 'Terima kasih sudah menghubungi kami! Untuk pertanyaan lebih lanjut, silakan cek halaman FAQ atau hubungi hello@noveluxe.com',
  },
  en: {
    'hai|halo|hello|hi': 'Hello! \ud83d\udc4b Welcome to Noveluxe. How can I help you today?',
    'promo|diskon|voucher': 'We have a special promo! Use code WELCOME10 for 10% off your first purchase.',
    'pengiriman|kirim|ongkir|shipping': 'We use JNE with 1-5 business days delivery. Shipping starts from Rp15,000.',
    'bayar|payment|pembayaran': 'We accept Bank Transfer, QRIS, E-Wallet, Virtual Account, and COD.',
    'return|retur|kembali': 'Returns can be made within 7 days of receipt if the book is damaged.',
    'default': 'Thank you for reaching out! For more questions, please check our FAQ page or email hello@noveluxe.com',
  },
};

function getBotReply(text: string, loc: string): string {
  const lower = text.toLowerCase();
  const replies = BOT_REPLIES[loc as keyof typeof BOT_REPLIES] || BOT_REPLIES.id;
  for (const [pattern, reply] of Object.entries(replies)) {
    if (pattern === 'default') continue;
    if (pattern.split('|').some((p) => lower.includes(p))) return reply;
  }
  return replies.default;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', text: 'Halo! \ud83d\udc4b Saya asisten Noveluxe. Ada yang bisa saya bantu hari ini?', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = useAppStore((s) => s.locale);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim(), time: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = getBotReply(userMsg.text, locale);
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: 'bot', text: reply, time: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const closeChat = () => { setIsOpen(false); setIsMinimized(false); };

  return (
    <div>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/40 transition-shadow"
            aria-label="Live Chat"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#D4AF37]" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/20 ${isMinimized ? 'h-12 w-72' : 'h-[480px] w-[360px] sm:w-[400px]'}`}
          >
            <div className="flex items-center justify-between bg-[#111111] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20">
                  <Bot className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Noveluxe Assistant</p>
                  <p className="text-xs text-white/50 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(!isMinimized)} className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={closeChat} className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex flex-col flex-1 min-h-0">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-secondary/20">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-foreground/10' : 'bg-[#D4AF37]/15'}`}>
                          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-[#D4AF37]" />}
                        </div>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'bg-[#D4AF37] text-white rounded-br-md' : 'bg-card border border-border rounded-bl-md'}`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                        <Bot className="h-3.5 w-3.5 text-[#D4AF37]" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-border p-3 bg-background">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={locale === 'id' ? 'Ketik pesan...' : 'Type a message...'} className="h-10 flex-1 border-border/50 text-sm" disabled={isTyping} />
                    <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-[#D4AF37] hover:bg-[#B8960C] text-white" disabled={!input.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
