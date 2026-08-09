'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Search,
  Mail,
  Phone,
  HelpCircle,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Truck,
  RotateCcw,
  Gift,
  CreditCard,
  User,
  X,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { FAQ } from '@/types';
import type { Locale } from '@/lib/i18n';

const FAQ_I18N: Record<string, { id: { q: string; a: string }; en: { q: string; a: string }; category: string }> = {
  'How long does shipping take?': {
    id: { q: 'Berapa lama waktu pengiriman?', a: 'Pengiriman reguler membutuhkan waktu 3-5 hari kerja. Pengiriman ekspres (1-2 hari) tersedia dengan biaya tambahan. Pre-order dikirim pada tanggal rilis.' },
    en: { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for an additional fee. Pre-orders ship on the release date.' },
    category: 'shipping',
  },
  'Do you offer international shipping?': {
    id: { q: 'Apakah tersedia pengiriman internasional?', a: 'Ya! Kami mengirim ke lebih dari 50 negara di seluruh dunia. Biaya dan waktu pengiriman internasional bervariasi sesuai tujuan. Gratis ongkir internasional untuk pembelian di atas Rp150.000.' },
    en: { q: 'Do you offer international shipping?', a: 'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Free international shipping on orders over Rp150,000.' },
    category: 'shipping',
  },
  'What is your return policy?': {
    id: { q: 'Apa kebijakan pengembalian?', a: 'Kami menerima pengembalian dalam 14 hari setelah penerimaan. Buku harus dalam kondisi asli dan belum dibaca. Cetak fisik yang rusak saat pengiriman akan diganti gratis.' },
    en: { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery. Books must be in original, unread condition. Damaged physical copies during shipping will be replaced for free.' },
    category: 'return',
  },
  'Do you offer gift wrapping?': {
    id: { q: 'Apakah tersedia layanan kado?', a: 'Tentu! Kami menyediakan layanan bungkus kado premium dengan pilihan kertas kado eksklusif dan kartu ucapan personal. Biaya mulai dari Rp15.000 per item.' },
    en: { q: 'Do you offer gift wrapping?', a: 'Of course! We offer premium gift wrapping with exclusive wrapping paper choices and personalized greeting cards. Starting from Rp15,000 per item.' },
    category: 'promo',
  },
  'Can I pre-order upcoming releases?': {
    id: { q: 'Bisakah saya pre-order buku yang akan terbit?', a: 'Ya! Anda bisa memesan buku yang akan datang. Pre-order menjamin Anda mendapatkan salinan pada hari rilis. Bonus spesial berupa bookmark eksklusif untuk setiap pre-order.' },
    en: { q: 'Can I pre-order upcoming releases?', a: 'Yes! You can pre-order upcoming books. Pre-ordering guarantees you get a copy on release day. Special bonus: exclusive bookmark with every pre-order.' },
    category: 'shipping',
  },
  'Do you have a loyalty program?': {
    id: { q: 'Apakah ada program loyalitas?', a: 'Ya, program "Noveluxe Rewards"! Setiap pembelian menghasilkan poin yang bisa ditukar dengan diskon. Member gold mendapat akses early access dan promo eksklusif setiap bulan.' },
    en: { q: 'Do you have a loyalty program?', a: 'Yes, the "Noveluxe Rewards" program! Every purchase earns points redeemable for discounts. Gold members get early access and exclusive monthly promos.' },
    category: 'promo',
  },
};

const FAQ_CATEGORIES = [
  { key: 'all', id: 'faq.categoryAll', en: 'faq.categoryAll', icon: BookOpen },
  { key: 'shipping', id: 'faq.categoryShipping', en: 'faq.categoryShipping', icon: Truck },
  { key: 'payment', id: 'faq.categoryPayment', en: 'faq.categoryPayment', icon: CreditCard },
  { key: 'return', id: 'faq.categoryReturn', en: 'faq.categoryReturn', icon: RotateCcw },
  { key: 'account', id: 'faq.categoryAccount', en: 'faq.categoryAccount', icon: User },
  { key: 'promo', id: 'faq.categoryPromo', en: 'faq.categoryPromo', icon: Gift },
];

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  shipping: Truck,
  payment: CreditCard,
  return: RotateCcw,
  account: User,
  promo: Gift,
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

function getLocalizedFAQ(faq: FAQ, locale: Locale) {
  const mapping = FAQ_I18N[faq.question];
  if (mapping) {
    return {
      ...faq,
      question: mapping[locale].q,
      answer: mapping[locale].a,
    };
  }
  return faq;
}

function getCategoryForFAQ(originalQuestion: string): string {
  return FAQ_I18N[originalQuestion]?.category || 'all';
}

function HighlightText({ text, highlight, className }: { text: string; highlight: string; className?: string }) {
  if (!highlight.trim()) return <span className={className}>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#D4AF37]/20 text-[#D4AF37] underline decoration-[#D4AF37]/60 underline-offset-2 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function FAQPage() {
  const { locale, setPage } = useAppStore();
  const lang = (locale ?? 'id') as Locale;
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchFAQs() {
      try {
        const res = await fetch('/api/faqs', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setFaqs(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
    return () => controller.abort();
  }, []);

  const localizedFAQs = useMemo(
    () => faqs.map((f) => getLocalizedFAQ(f, lang)),
    [faqs, lang]
  );

  const filteredFAQs = useMemo(() => {
    let result = localizedFAQs;
    if (activeCategory !== 'all') {
      result = result.filter((faq) => {
        const originalQ = faqs.find((f) => f.id === faq.id)?.question;
        const cat = getCategoryForFAQ(originalQ || faq.question);
        return cat === activeCategory;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [localizedFAQs, searchQuery, activeCategory, faqs]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef?.focus();
  }, [searchInputRef]);

  const handleHelpful = useCallback((id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isSearching = searchQuery.trim().length > 0 || activeCategory !== 'all';

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 py-16 md:py-24">
        {/* Gold gradient orb top-right */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-1/4 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative mx-auto max-w-3xl px-4 text-center"
        >
          <motion.div variants={fadeInUp} className="mb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <HelpCircle className="h-8 w-8 text-[#D4AF37]" />
            </div>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-heading text-4xl font-bold tracking-tight md:text-5xl"
          >
            {t('faq.title', lang)}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto"
          >
            {t('faq.subtitle', lang)}
          </motion.p>
        </motion.div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => setPage('home')}
                className="cursor-pointer hover:text-[#D4AF37]"
              >
                {t('nav.home', lang)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{lang === 'id' ? 'FAQ' : 'FAQ'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search, Category Filter & FAQ Content */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={setSearchInputRef}
            placeholder={t('faq.searchPlaceholder', lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 pr-10 rounded-xl border-border/60 focus-visible:border-[#D4AF37]/50 focus-visible:ring-[#D4AF37]/20"
          />
          <AnimatePresence>
            {searchQuery.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <LayoutGroup>
            <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
              {FAQ_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#B8960C]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                    <span>{t(cat.id, lang)}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryTab"
                        className="absolute inset-0 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/8"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryUnderline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#D4AF37]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </motion.div>

        {/* Result count */}
        {isSearching && !loading && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm text-muted-foreground flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>
              {filteredFAQs.length} {t('faq.questionsFound', lang)}
            </span>
          </motion.p>
        )}

        {/* FAQ Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-5 border-l-2 border-l-[#D4AF37]/30">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredFAQs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="relative mx-auto mb-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                <HelpCircle className="h-10 w-10 text-[#D4AF37]/30" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border border-[#D4AF37]/20"
              />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">
              {t('faq.noResults', lang)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70 max-w-sm mx-auto">
              {t('faq.noResultsDesc', lang)}
            </p>
            {(searchQuery.trim() || activeCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
              >
                {lang === 'id' ? 'Tampilkan Semua' : 'Show All'}
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredFAQs.map((faq) => {
                const originalQ = faqs.find((f) => f.id === faq.id)?.question;
                const category = getCategoryForFAQ(originalQ || faq.question);
                const CatIcon = CATEGORY_ICON_MAP[category];
                const isHelpful = helpfulIds.has(faq.id);
                return (
                  <motion.div key={faq.id} variants={fadeInUp}>
                    <AccordionItem
                      value={faq.id}
                      className="group border-border/60 rounded-xl border-l-2 border-l-[#D4AF37] px-5 transition-all duration-200 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 hover:shadow-sm hover:shadow-[#D4AF37]/5 data-[state=open]:bg-[#D4AF37]/5 data-[state=open]:border-[#D4AF37]/30 data-[state=open]:shadow-sm data-[state=open]:shadow-[#D4AF37]/5"
                    >
                      <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-4 gap-3">
                        <div className="flex items-start gap-3">
                          {CatIcon && (
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                              <CatIcon className="h-4 w-4" />
                            </span>
                          )}
                          <span className="text-left">
                            {searchQuery.trim() ? (
                              <HighlightText text={faq.question} highlight={searchQuery} />
                            ) : (
                              faq.question
                            )}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pl-11 pb-4">
                        <div className="relative">
                          {searchQuery.trim() ? (
                            <HighlightText text={faq.answer} highlight={searchQuery} />
                          ) : (
                            faq.answer
                          )}
                          {/* Helpful button */}
                          <div className="mt-4 flex items-center justify-end">
                            <button
                              onClick={() => handleHelpful(faq.id)}
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                isHelpful
                                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                                  : 'text-muted-foreground/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border border-transparent'
                              }`}
                            >
                              <ThumbsUp className={`h-3.5 w-3.5 transition-transform duration-200 ${isHelpful ? 'fill-[#D4AF37]' : ''}`} />
                              {t('faq.helpful', lang)}
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>
        )}
      </section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl px-4 pb-16"
      >
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 to-transparent p-8 md:p-12 relative overflow-hidden">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#D4AF37]/8 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-[#D4AF37]/5 blur-2xl" />

          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <MessageSquare className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-center">
              {t('faq.stillHaveQuestions', lang)}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto text-center">
              {t('faq.contactDesc', lang)}
            </p>

            {/* 3 Contact Cards */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email Card */}
              <motion.a
                href="mailto:hello@noveluxe.com"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-6 transition-all duration-200 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-colors duration-200 group-hover:bg-[#D4AF37]/15">
                  <Mail className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('faq.contactEmail', lang)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    hello@noveluxe.com
                  </p>
                </div>
              </motion.a>

              {/* Phone Card */}
              <motion.a
                href="tel:+622112345678"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-6 transition-all duration-200 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-colors duration-200 group-hover:bg-[#D4AF37]/15">
                  <Phone className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('faq.contactPhone', lang)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    +62 21 1234 5678
                  </p>
                </div>
              </motion.a>

              {/* WhatsApp Card */}
              <motion.a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background p-6 transition-all duration-200 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 transition-colors duration-200 group-hover:bg-[#D4AF37]/15">
                  <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('faq.contactWhatsApp', lang)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#D4AF37]">
                    {t('faq.contactWhatsAppDesc', lang)}
                  </p>
                </div>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}