'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Copy,
  Check,
  Clock,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface Voucher {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  maxDisc: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

function getDaysLeft(validTo: string): number {
  const now = new Date();
  const end = new Date(validTo);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string, locale: 'id' | 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function VoucherCard({
  voucher,
  locale,
  index,
}: {
  voucher: Voucher;
  locale: 'id' | 'en';
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const daysLeft = getDaysLeft(voucher.validTo);
  const usagePercent =
    voucher.usageLimit > 0
      ? Math.min(100, (voucher.usedCount / voucher.usageLimit) * 100)
      : 0;
  const isExpiring = daysLeft <= 7 && daysLeft > 0;
  const isExpiringToday = daysLeft === 0;
  const isHighUsage = usagePercent > 80;

  const handleClaim = useCallback(() => {
    navigator.clipboard.writeText(voucher.code).then(() => {
      setCopied(true);
      toast.success(t('voucher.copied', locale));
      setTimeout(() => setCopied(false), 2000);
    });
  }, [voucher.code, locale]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative"
    >
      {/* Ticket Card - enhanced hover: lift, gold shadow glow, slight scale */}
      <div
        className={`relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/15 hover:-translate-y-1 hover:scale-[1.01] ${
          isExpiring
            ? 'border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/20'
            : 'border-border'
        }`}
      >
        {/* Gold top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#E8D48B] to-[#D4AF37]" />

        <div className="flex flex-col sm:flex-row">
          {/* Left Section - Discount Badge */}
          <div className="relative flex sm:w-44 shrink-0 items-center justify-center bg-gradient-to-br from-[#D4AF37]/10 via-[#F5E6A3]/5 to-[#D4AF37]/10 px-6 py-6 sm:py-0">
            {/* Left circle cutout */}
            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
            {/* Right circle cutout (desktop) */}
            <div className="hidden sm:block absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />

            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37] leading-none">
                {voucher.discount}%
              </div>
              <div className="text-xs font-semibold text-[#D4AF37]/70 uppercase tracking-wider mt-1">
                {t('voucher.discount', locale)}
              </div>
            </div>
          </div>

          {/* Dashed separator (desktop) */}
          <div className="hidden sm:block absolute left-44 top-[calc(1.5rem+12px)] bottom-3 w-px">
            <div className="w-full border-l-2 border-dashed border-[#D4AF37]/30" />
          </div>
          {/* Dashed separator (mobile) - horizontal */}
          <div className="sm:hidden border-t-2 border-dashed border-[#D4AF37]/30 mx-4" />

          {/* Right Section - Details */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3">
            {/* Code row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-foreground bg-muted px-3 py-1 rounded-md">
                  {voucher.code}
                </span>
              </div>
              {isExpiring && !isExpiringToday && (
                <div className="flex items-center gap-1 text-amber-500 shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    {daysLeft} {t('voucher.daysLeft', locale)}
                  </span>
                </div>
              )}
              {isExpiringToday && (
                <div className="flex items-center gap-1 text-red-500 shrink-0">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    {t('voucher.expiresToday', locale)}
                  </span>
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t('voucher.minOrder', locale)}
                </span>
                <p className="font-semibold text-foreground">
                  {formatPrice(voucher.minOrder, locale)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('voucher.validUntil', locale)}
                </span>
                <p className="font-semibold text-foreground">
                  {formatDate(voucher.validTo, locale)}
                </p>
              </div>
              {voucher.maxDisc !== null && voucher.maxDisc > 0 && (
                <div>
                  <span className="text-muted-foreground">
                    {t('voucher.maxDisc', locale)}
                  </span>
                  <p className="font-semibold text-foreground">
                    {formatPrice(voucher.maxDisc, locale)}
                  </p>
                </div>
              )}
            </div>

            {/* Usage bar */}
            {voucher.usageLimit > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t('voucher.usage', locale)}
                  </span>
                  <span className="font-medium text-foreground">
                    {voucher.usedCount} {t('voucher.usedOf', locale)} {voucher.usageLimit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.07 + 0.3 }}
                    className={`relative h-full rounded-full ${
                      usagePercent > 80
                        ? 'bg-red-400'
                        : usagePercent > 50
                        ? 'bg-amber-400'
                        : 'bg-[#D4AF37]'
                    }`}
                  >
                    {/* Shimmer animation effect when usage is high (>80%) */}
                    {isHighUsage && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                          backgroundSize: '200% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['-200% 0', '200% 0'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            )}
            {voucher.usageLimit === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('voucher.unlimited', locale)}
              </p>
            )}

            {/* Claim button - with checkmark animation when claimed */}
            <Button
              onClick={handleClaim}
              disabled={copied}
              className={`mt-auto w-full sm:w-auto rounded-xl font-semibold transition-all duration-300 ${
                copied
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-[#D4AF37] hover:bg-[#B8960C] text-white shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30'
              }`}
            >
              {copied ? (
                <>
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="inline-flex"
                  >
                    <Check className="h-4 w-4 mr-2" />
                  </motion.span>
                  {t('voucher.claimed', locale)}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('voucher.claim', locale)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VoucherEmptyState({
  locale,
  onExplore,
}: {
  locale: 'id' | 'en';
  onExplore: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 sm:py-24 px-4"
    >
      {/* Decorative circles */}
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.06, 1], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#F5E6A3]/20 border border-[#D4AF37]/30"
        >
          <Ticket className="h-14 w-14 text-[#D4AF37]" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute -inset-4 rounded-full border border-[#D4AF37]/20"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          className="absolute -inset-10 rounded-full border border-[#D4AF37]/10"
        />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
        {t('voucher.empty', locale)}
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        {t('voucher.emptyDesc', locale)}
      </p>
      <Button
        onClick={onExplore}
        className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-8 py-2.5 shadow-lg shadow-[#D4AF37]/25 transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-105 group"
      >
        <ShoppingBag className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        {t('voucher.exploreCatalog', locale)}
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="h-1.5 bg-muted" />
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-44 flex items-center justify-center p-8">
              <Skeleton className="h-16 w-24 rounded-lg" />
            </div>
            <div className="flex-1 p-5 space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VoucherPage() {
  const { locale, setPage } = useAppStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/vouchers')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setVouchers(data.vouchers || []);
      })
      .catch(() => {
        if (!cancelled) setVouchers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const expiringVouchers = useMemo(
    () => vouchers.filter((v) => getDaysLeft(v.validTo) <= 7 && getDaysLeft(v.validTo) > 0),
    [vouchers]
  );

  const regularVouchers = useMemo(
    () => vouchers.filter((v) => getDaysLeft(v.validTo) > 7),
    [vouchers]
  );

  const isEmpty = !loading && vouchers.length === 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#D4AF37]/5 via-[#D4AF37]/3 to-transparent pt-8 pb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/8 via-transparent to-transparent" />

        {/* Floating gold sparkle decorations in hero section */}
        <div className="absolute top-[20%] left-[12%] z-[2] pointer-events-none">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-[#D4AF37]/30" />
          </motion.div>
        </div>
        <div className="absolute top-[30%] right-[15%] z-[2] pointer-events-none">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <Sparkles className="h-5 w-5 text-[#E8D48B]/35" />
          </motion.div>
        </div>
        <div className="absolute top-[55%] left-[20%] z-[2] pointer-events-none">
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            <Sparkles className="h-3 w-3 text-[#D4AF37]/25" />
          </motion.div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage('home');
                    }}
                  >
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{t('voucher.title', locale)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-center mb-4"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-6 w-6 text-[#D4AF37]" />
              </motion.div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#D4AF37] via-[#E8D48B] to-[#D4AF37] bg-clip-text text-transparent">
                {t('voucher.heroTitle', locale)}
              </h1>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
              >
                <Ticket className="h-6 w-6 text-[#D4AF37]" />
              </motion.div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              {t('voucher.heroSubtitle', locale)}
            </p>
          </motion.div>

          {/* Decorative divider */}
          <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Empty State */}
        {isEmpty && (
          <VoucherEmptyState
            locale={locale}
            onExplore={() => setPage('catalog')}
          />
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Voucher Lists */}
        {!loading && vouchers.length > 0 && (
          <div className="space-y-10">
            {/* Expiring Soon Section */}
            <AnimatePresence>
              {expiringVouchers.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        {t('voucher.expiringSoon', locale)}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {t('voucher.expiringSoonDesc', locale)}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5">
                    {expiringVouchers.map((v, i) => (
                      <VoucherCard
                        key={v.id}
                        voucher={v}
                        locale={locale}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Decorative gold divider between expiring soon and all vouchers */}
            {expiringVouchers.length > 0 && regularVouchers.length > 0 && (
              <div
                className="h-[1px] w-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.35), rgba(232,212,139,0.45), rgba(212,175,55,0.35), transparent)',
                }}
              />
            )}

            {/* All Vouchers Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                  <Ticket className="h-5 w-5 text-[#D4AF37]" />
                </div>
                {/* Section heading with gold left border accent */}
                <div className="border-l-[3px] border-[#D4AF37] pl-3">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {t('voucher.allVouchers', locale)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t('voucher.allVouchersDesc', locale)}
                  </p>
                </div>
              </div>
              <div className="grid gap-5">
                {regularVouchers.map((v, i) => (
                  <VoucherCard
                    key={v.id}
                    voucher={v}
                    locale={locale}
                    index={i}
                  />
                ))}
                {/* If no regular vouchers, show all here (edge case: all are expiring) */}
                {regularVouchers.length === 0 && expiringVouchers.length > 0 && null}
              </div>
              {/* If all vouchers are expiring, don't show empty regular section */}
              {regularVouchers.length === 0 && expiringVouchers.length > 0 && (
                <div className="hidden" />
              )}
            </motion.section>
          </div>
        )}
      </div>
    </div>
  );
}
