'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Calendar,
  Award,
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

const FAQ_I18N: Record<string, { id: { q: string; a: string }; en: { q: string; a: string } }> = {
  'How long does shipping take?': {
    id: { q: 'Berapa lama waktu pengiriman?', a: 'Pengiriman reguler membutuhkan waktu 3-5 hari kerja. Pengiriman ekspres (1-2 hari) tersedia dengan biaya tambahan. Pre-order dikirim pada tanggal rilis.' },
    en: { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for an additional fee. Pre-orders ship on the release date.' },
  },
  'Do you offer international shipping?': {
    id: { q: 'Apakah tersedia pengiriman internasional?', a: 'Ya! Kami mengirim ke lebih dari 50 negara di seluruh dunia. Biaya dan waktu pengiriman internasional bervariasi sesuai tujuan. Gratis ongkir internasional untuk pembelian di atas Rp150.000.' },
    en: { q: 'Do you offer international shipping?', a: 'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Free international shipping on orders over Rp150.000.' },
  },
  'What is your return policy?': {
    id: { q: 'Apa kebijakan pengembalian?', a: 'Kami menerima pengembalian dalam 14 hari setelah penerimaan. Buku harus dalam kondisi asli dan belum dibaca. Cetak fisik yang rusak saat pengiriman akan diganti gratis.' },
    en: { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery. Books must be in original, unread condition. Damaged physical copies during shipping will be replaced for free.' },
  },
  'Do you offer gift wrapping?': {
    id: { q: 'Apakah tersedia layanan kado?', a: 'Tentu! Kami menyediakan layanan bungkus kado premium dengan pilihan kertas kado eksklusif dan kartu ucapan personal. Biaya mulai dari Rp15.000 per item.' },
    en: { q: 'Do you offer gift wrapping?', a: 'Of course! We offer premium gift wrapping with exclusive wrapping paper choices and personalized greeting cards. Starting from Rp15,000 per item.' },
  },
  'Can I pre-order upcoming releases?': {
    id: { q: 'Bisakah saya pre-order buku yang akan terbit?', a: 'Ya! Anda bisa memesan buku yang akan datang. Pre-order menjamin Anda mendapatkan salinan pada hari rilis. Bonus spesial berupa bookmark eksklusif untuk setiap pre-order.' },
    en: { q: 'Can I pre-order upcoming releases?', a: 'Yes! You can pre-order upcoming books. Pre-ordering guarantees you get a copy on release day. Special bonus: exclusive bookmark with every pre-order.' },
  },
  'Do you have a loyalty program?': {
    id: { q: 'Apakah ada program loyalitas?', a: 'Ya, program "Noveluxe Rewards"! Setiap pembelian menghasilkan poin yang bisa ditukar dengan diskon. Member gold mendapat akses early access dan promo eksklusif setiap bulan.' },
    en: { q: 'Do you have a loyalty program?', a: 'Yes, the "Noveluxe Rewards" program! Every purchase earns points redeemable for discounts. Gold members get early access and exclusive monthly promos.' },
  },
};

const FAQ_ICONS: Record<string, React.ReactNode> = {
  'How long does shipping take?': <Truck className="h-4 w-4" />,
  'Do you offer international shipping?': <Truck className="h-4 w-4" />,
  'What is your return policy?': <RotateCcw className="h-4 w-4" />,
  'Do you offer gift wrapping?': <Gift className="h-4 w-4" />,
  'Can I pre-order upcoming releases?': <Calendar className="h-4 w-4" />,
  'Do you have a loyalty program?': <Award className="h-4 w-4" />,
};

const FAQ_CATEGORIES = [
  { key: 'all', id: 'Semua', en: 'All' },
  { key: 'shipping', id: 'Pengiriman', en: 'Shipping' },
  { key: 'orders', id: 'Pesanan', en: 'Orders' },
  { key: 'products', id: 'Produk', en: 'Products' },
  { key: 'rewards', id: 'Reward', en: 'Rewards' },
];

const FAQ_CATEGORY_MAP: Record<string, string[]> = {
  shipping: ['How long does shipping take?', 'Do you offer international shipping?'],
  orders: ['What is your return policy?', 'Can I pre-order upcoming releases?'],
  products: ['Do you offer gift wrapping?'],
  rewards: ['Do you have a loyalty program?'],
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

export default function FAQPage() {
  const { locale, setPage } = useAppStore();
  const lang = (locale ?? 'id') as Locale;
   const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
      const questionKeys = FAQ_CATEGORY_MAP[activeCategory] || [];
      result = result.filter((faq) => questionKeys.some((k) => faq.question === k || faq.answer.includes(k)));
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
  }, [localizedFAQs, searchQuery, activeCategory]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/50 py-16 md:py-24">
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
            {lang === 'id' ? 'Pertanyaan Umum' : 'Frequently Asked Questions'}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto"
          >
            {lang === 'id'
              ? 'Temukan jawaban untuk pertanyaan yang paling sering diajukan'
              : 'Find answers to the most frequently asked questions'}
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

      {/* Search & Category Filter & FAQ Content */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              lang === 'id'
                ? 'Cari pertanyaan...'
                : 'Search questions...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 pr-4 rounded-xl border-border/60 focus-visible:border-[#D4AF37]/50 focus-visible:ring-[#D4AF37]/20"
          />
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat.key
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm shadow-[#D4AF37]/25'
                  : 'bg-background text-muted-foreground border-border hover:border-[#D4AF37]/40 hover:text-foreground'
              }`}
            >
              {cat[lang]}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-5">
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
            className="py-16 text-center"
          >
            <HelpCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              {lang === 'id'
                ? 'Tidak ada pertanyaan ditemukan'
                : 'No questions found'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === 'id'
                ? 'Coba kata kunci yang berbeda'
                : 'Try a different keyword'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredFAQs.map((faq) => {
                const originalQ = localizedFAQs.find((f) => f.id === faq.id)?.question;
                const icon = FAQ_ICONS[originalQ || faq.question];
                return (
                  <motion.div key={faq.id} variants={fadeInUp}>
                    <AccordionItem
                      value={faq.id}
                      className="border-border/60 rounded-xl px-5 transition-all duration-200 hover:bg-secondary/30 hover:border-[#D4AF37]/20 hover:shadow-sm data-[state=open]:bg-[#D4AF37]/5 data-[state=open]:border-[#D4AF37]/30"
                    >
                      <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-4 gap-3">
                        {icon && (
                          <span className="text-[#D4AF37] shrink-0">{icon}</span>
                        )}
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pl-7">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>
        )}

        {searchQuery.trim() && filteredFAQs.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {lang === 'id'
              ? `Menampilkan ${filteredFAQs.length} dari ${localizedFAQs.length} pertanyaan`
              : `Showing ${filteredFAQs.length} of ${localizedFAQs.length} questions`}
          </p>
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
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 to-transparent p-8 text-center md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <MessageSquare className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h2 className="font-heading text-2xl font-bold">
              {lang === 'id'
                ? 'Masih punya pertanyaan?'
                : 'Still have questions?'}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {lang === 'id'
                ? 'Tim kami siap membantu kamu. Hubungi kami melalui:'
                : 'Our team is here to help. Reach out to us via:'}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:hello@noveluxe.com"
                className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-background px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 hover:shadow-sm hover:shadow-[#D4AF37]/10"
              >
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                hello@noveluxe.com
              </a>
              <a
                href="tel:+6281234567890"
                className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-background px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 hover:shadow-sm hover:shadow-[#D4AF37]/10"
              >
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                +62 812-3456-7890
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
