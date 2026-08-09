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

export default function FAQPage() {
  const { locale, setPage } = useAppStore();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

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
            <HelpCircle className="mx-auto h-12 w-12 text-[#D4AF37]" />
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="font-heading text-4xl font-bold tracking-tight md:text-5xl"
          >
            FAQ
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-muted-foreground"
          >
            {locale === 'id'
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
                {t('nav.home', locale)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav.faq', locale)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search & FAQ Content */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              locale === 'id'
                ? 'Cari pertanyaan...'
                : 'Search questions...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 pr-4"
          />
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
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
              {locale === 'id'
                ? 'Tidak ada pertanyaan ditemukan'
                : 'No questions found'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === 'id'
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
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <motion.div key={faq.id} variants={fadeInUp}>
                  <AccordionItem
                    value={faq.id}
                    className="border-border/60 rounded-lg px-4 transition-colors hover:bg-secondary/30"
                  >
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        )}

        {searchQuery.trim() && filteredFAQs.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {locale === 'id'
              ? `Menampilkan ${filteredFAQs.length} dari ${faqs.length} pertanyaan`
              : `Showing ${filteredFAQs.length} of ${faqs.length} questions`}
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
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-secondary/30 p-8 text-center md:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10">
            <BookOpen className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <h2 className="font-heading text-2xl font-bold">
            {locale === 'id'
              ? 'Masih punya pertanyaan?'
              : 'Still have questions?'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {locale === 'id'
              ? 'Tim kami siap membantu kamu. Hubungi kami melalui:'
              : 'Our team is here to help. Reach out to us via:'}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:hello@noveluxe.com"
              className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#D4AF37]/10"
            >
              <Mail className="h-4 w-4 text-[#D4AF37]" />
              hello@noveluxe.com
            </a>
            <a
              href="tel:+6281234567890"
              className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#D4AF37]/10"
            >
              <Phone className="h-4 w-4 text-[#D4AF37]" />
              +62 812-3456-7890
            </a>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
