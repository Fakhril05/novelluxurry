'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Star,
  Crown,
  Gem,
  ShoppingBag,
  MessageSquare,
  LogIn,
  Users,
  Share2,
  Cake,
  ArrowRight,
  Check,
  X,
  Award,
  BookOpen,
  Sparkles,
  Gift,
  TrendingUp,
  Zap,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { LucideIcon } from 'lucide-react';

// --- Types ---
type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierDef {
  key: TierKey;
  min: number;
  max: number;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderClass: string;
  glowClass: string;
  benefits: string[];
}

// --- Tier Definitions ---
const TIERS: TierDef[] = [
  {
    key: 'bronze',
    min: 0,
    max: 999,
    icon: Shield,
    color: '#CD7F32',
    bgGradient: 'from-amber-900/20 via-amber-800/10 to-transparent',
    borderClass: 'border-[#CD7F32]/40',
    glowClass: 'shadow-[#CD7F32]/0',
    benefits: ['loyalty.benefit.freeShipping'],
  },
  {
    key: 'silver',
    min: 1000,
    max: 2999,
    icon: Star,
    color: '#C0C0C0',
    bgGradient: 'from-gray-400/20 via-gray-300/10 to-transparent',
    borderClass: 'border-[#C0C0C0]/40',
    glowClass: 'shadow-[#C0C0C0]/0',
    benefits: ['loyalty.benefit.freeShipping', 'loyalty.benefit.birthdayDiscount', 'loyalty.benefit.earlyAccess'],
  },
  {
    key: 'gold',
    min: 3000,
    max: 4999,
    icon: Crown,
    color: '#D4AF37',
    bgGradient: 'from-[#D4AF37]/20 via-[#E8D48B]/10 to-transparent',
    borderClass: 'border-[#D4AF37]/50',
    glowClass: 'shadow-[#D4AF37]/0',
    benefits: ['loyalty.benefit.freeShipping', 'loyalty.benefit.birthdayDiscount', 'loyalty.benefit.earlyAccess', 'loyalty.benefit.exclusiveBooks', 'loyalty.benefit.doublePoints'],
  },
  {
    key: 'platinum',
    min: 5000,
    max: Infinity,
    icon: Gem,
    color: '#7EB8DA',
    bgGradient: 'from-sky-300/20 via-sky-200/10 to-transparent',
    borderClass: 'border-sky-400/40',
    glowClass: 'shadow-sky-400/0',
    benefits: ['loyalty.benefit.freeShipping', 'loyalty.benefit.birthdayDiscount', 'loyalty.benefit.earlyAccess', 'loyalty.benefit.exclusiveBooks', 'loyalty.benefit.doublePoints', 'loyalty.benefit.voucherMonthly', 'loyalty.benefit.prioritySupport', 'loyalty.benefit.freeEbook', 'loyalty.benefit.inviteEvents', 'loyalty.benefit.customBadge', 'loyalty.benefit.personalRecom'],
  },
];

// --- Earn Points Cards ---
const EARN_CARDS: { icon: LucideIcon; titleKey: string; descKey: string; ptsKey: string }[] = [
  { icon: ShoppingBag, titleKey: 'loyalty.earn.purchase', descKey: 'loyalty.earn.purchaseDesc', ptsKey: 'loyalty.earn.purchasePts' },
  { icon: MessageSquare, titleKey: 'loyalty.earn.review', descKey: 'loyalty.earn.reviewDesc', ptsKey: 'loyalty.earn.reviewPts' },
  { icon: LogIn, titleKey: 'loyalty.earn.login', descKey: 'loyalty.earn.loginDesc', ptsKey: 'loyalty.earn.loginPts' },
  { icon: Users, titleKey: 'loyalty.earn.referral', descKey: 'loyalty.earn.referralDesc', ptsKey: 'loyalty.earn.referralPts' },
  { icon: Share2, titleKey: 'loyalty.earn.share', descKey: 'loyalty.earn.shareDesc', ptsKey: 'loyalty.earn.sharePts' },
  { icon: Cake, titleKey: 'loyalty.earn.birthday', descKey: 'loyalty.earn.birthdayDesc', ptsKey: 'loyalty.earn.birthdayPts' },
];

// --- Mock Point History ---
const MOCK_HISTORY = [
  { date: '2025-01-15', descriptionKey: 'loyalty.earn.purchase', extra: 'Bumi, Laut Bercerita', points: 89, type: 'earned' as const },
  { date: '2025-01-14', descriptionKey: 'loyalty.earn.review', extra: 'Laskar Pelangi', points: 50, type: 'earned' as const },
  { date: '2025-01-12', descriptionKey: 'loyalty.earn.referral', extra: 'Rina@gmail.com', points: 200, type: 'earned' as const },
  { date: '2025-01-10', descriptionKey: 'loyalty.earn.login', extra: '', points: 5, type: 'earned' as const },
  { date: '2025-01-09', descriptionKey: 'loyalty.earn.share', extra: 'Instagram', points: 10, type: 'earned' as const },
  { date: '2025-01-08', descriptionKey: 'loyalty.earn.birthday', extra: '', points: 100, type: 'earned' as const },
  { date: '2025-01-07', descriptionKey: 'loyalty.earn.purchase', extra: 'Filosofi Teras, Ronggeng Dukuh Paruk', points: 154, type: 'earned' as const },
  { date: '2025-01-05', descriptionKey: 'loyalty.earn.purchase', extra: 'Tenggelamnya Kapal Van Der Wijck', points: 85, type: 'earned' as const },
];

// --- Comparison rows ---
const COMPARISON_ROWS: { key: string; bronze: boolean; silver: boolean; gold: boolean; platinum: boolean }[] = [
  { key: 'loyalty.comparison.freeShipping', bronze: true, silver: true, gold: true, platinum: true },
  { key: 'loyalty.comparison.birthdayDiscount', bronze: false, silver: true, gold: true, platinum: true },
  { key: 'loyalty.comparison.earlyAccess', bronze: false, silver: true, gold: true, platinum: true },
  { key: 'loyalty.comparison.exclusiveBooks', bronze: false, silver: false, gold: true, platinum: true },
  { key: 'loyalty.comparison.doublePoints', bronze: false, silver: false, gold: true, platinum: true },
  { key: 'loyalty.comparison.voucher', bronze: false, silver: false, gold: false, platinum: true },
  { key: 'loyalty.comparison.prioritySupport', bronze: false, silver: false, gold: false, platinum: true },
  { key: 'loyalty.comparison.freeEbook', bronze: false, silver: false, gold: false, platinum: true },
  { key: 'loyalty.comparison.events', bronze: false, silver: false, gold: false, platinum: true },
  { key: 'loyalty.comparison.customBadge', bronze: false, silver: false, gold: false, platinum: true },
];

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// --- Helper: get user tier ---
function getUserTier(points: number): TierDef {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

// --- Helper: get next tier ---
function getNextTier(points: number): TierDef | null {
 const current = getUserTier(points);
  const idx = TIERS.findIndex((t) => t.key === current.key);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

// --- Helper: get progress to next tier ---
function getTierProgress(points: number): { progress: number; needed: number; nextMin: number } {
  const current = getUserTier(points);
  const next = getNextTier(points);
  if (!next) return { progress: 100, needed: 0, nextMin: current.max };
  const range = next.min - current.min;
  const elapsed = points - current.min;
  return {
    progress: Math.min(100, Math.round((elapsed / range) * 100)),
    needed: next.min - points,
    nextMin: next.min,
  };
}

// ===========================================================
// Component
// ===========================================================

export default function LoyaltyPage() {
  const { locale, user, isAuthenticated, setPage } = useAppStore();

  const points = user?.points || 0;
  const currentTier = useMemo(() => getUserTier(points), [points]);
  const nextTier = useMemo(() => getNextTier(points), [points]);
  const { progress, needed } = useMemo(() => getTierProgress(points), [points]);

  // --- Login Required State ---
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
            <Award className="h-10 w-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('loyalty.loginRequired', locale)}</h1>
          <p className="text-muted-foreground mb-8">{t('loyalty.loginRequiredDesc', locale)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setPage('login')}
              className="bg-[#D4AF37] text-white hover:bg-[#B8960C] gap-2"
            >
              <LogIn className="h-4 w-4" />
              {t('loyalty.goToLogin', locale)}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage('register')}
              className="gap-2"
            >
              {t('loyalty.goToRegister', locale)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-4 pb-6"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setPage('home')} className="cursor-pointer hover:text-[#D4AF37] transition-colors">
                  {t('nav.home', locale)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#D4AF37] font-medium">{t('nav.loyalty', locale)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* ======================== */}
        {/* Hero: My Points Summary */}
        {/* ======================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent p-6 sm:p-8 md:p-10"
        >
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#D4AF37]/5 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                {(() => {
                  const Icon = currentTier.icon;
                  return <Icon className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: currentTier.color }} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('loyalty.myPoints', locale)}</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: '#D4AF37' }}>
                  {points.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="border font-medium" style={{ borderColor: currentTier.color, color: currentTier.color }}>
                    {t(`loyalty.tier.${currentTier.key}`, locale)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t('loyalty.currentTier', locale)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="md:max-w-xs w-full">
              {nextTier ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('loyalty.nextTier', locale)}: <span style={{ color: nextTier.color }} className="font-semibold">{t(`loyalty.tier.${nextTier.key}`, locale)}</span></span>
                    <span className="text-sm font-semibold text-[#D4AF37]">{progress}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    <span className="font-semibold text-foreground">{needed.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}</span> {t('loyalty.pointsToNext', locale)}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-3">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#D4AF37]">{t('loyalty.maxTier', locale)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ======================== */}
        {/* Tier Cards */}
        {/* ======================== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('loyalty.tiersTitle', locale)}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t('loyalty.tiersDesc', locale)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {TIERS.map((tier) => {
              const isActive = tier.key === currentTier.key;
              const TierIcon = tier.icon;
              const nextForTier = getNextTier(tier.min);
              const tierProgress = getTierProgress(isActive ? points : tier.min);

              return (
                <motion.div
                  key={tier.key}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl border-2 bg-gradient-to-b ${tier.bgGradient} p-5 transition-shadow duration-300 ${
                    isActive
                      ? `${tier.borderClass} shadow-[0_0_30px_-5px_${tier.color}]`
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      <Badge className="bg-[#D4AF37] text-white border-0 px-3 py-0.5 text-xs font-semibold shadow-md shadow-[#D4AF37]/30">
                        {t('loyalty.currentTier', locale)}
                      </Badge>
                    </motion.div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl mb-3 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                      style={{
                        backgroundColor: `${tier.color}15`,
                        border: `1.5px solid ${tier.color}40`,
                      }}
                    >
                      <TierIcon className="h-7 w-7" style={{ color: tier.color }} />
                    </div>

                    <h3 className="text-lg font-bold mb-1" style={{ color: tier.color }}>
                      {t(`loyalty.tier.${tier.key}`, locale)}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {t(`loyalty.tierRange.${tier.key}`, locale)}
                    </p>

                    {/* Benefits list */}
                    <div className="w-full text-left mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t('loyalty.tierBenefits', locale)}</p>
                      <ul className="space-y-1.5">
                        {tier.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-xs">
                            <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: tier.color }} />
                            <span className="text-foreground/80">{t(b, locale)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress bar for current tier only */}
                    {isActive && nextForTier && (
                      <div className="w-full mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{t('loyalty.progress', locale)}</span>
                          <span className="text-[10px] font-semibold" style={{ color: tier.color }}>{tierProgress.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tierProgress.progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ======================== */}
        {/* How to Earn Points */}
        {/* ======================== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
              <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('loyalty.howToEarn', locale)}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t('loyalty.howToEarnDesc', locale)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {EARN_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.titleKey}
                  variants={scaleIn}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group rounded-xl border border-border bg-card p-5 hover:border-[#D4AF37]/40 hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1">{t(card.titleKey, locale)}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{t(card.descKey, locale)}</p>
                      <Badge variant="secondary" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-xs font-semibold hover:bg-[#D4AF37]/20">
                        <Zap className="h-3 w-3 mr-1" />
                        {t(card.ptsKey, locale)}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ======================== */}
        {/* Point History */}
        {/* ======================== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <BookOpen className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{t('loyalty.history', locale)}</h2>
              <p className="text-sm text-muted-foreground">{t('loyalty.historyDesc', locale)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">{t('loyalty.history.date', locale)}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">{t('loyalty.history.description', locale)}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">{t('loyalty.history.points', locale)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_HISTORY.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-3 sm:p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div>
                        <p className="text-sm font-medium">{t(item.descriptionKey, locale)}</p>
                        {item.extra && <p className="text-xs text-muted-foreground mt-0.5">{item.extra}</p>}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <span className={`text-sm font-semibold ${item.type === 'earned' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.type === 'earned' ? '+' : '-'}{item.points}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* ======================== */}
        {/* Tier Comparison Table */}
        {/* ======================== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
              <Gift className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t('loyalty.comparison', locale)}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{t('loyalty.comparisonDesc', locale)}</p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">{t('loyalty.comparison.tier', locale)}</TableHead>
                  {TIERS.map((tier) => {
                    const TierIcon = tier.icon;
                    const isActive = tier.key === currentTier.key;
                    return (
                      <TableHead key={tier.key} className={`text-center text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-[#D4AF37]' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          <TierIcon className="h-4 w-4 mx-auto" style={{ color: tier.color }} />
                          <span style={isActive ? { color: '#D4AF37' } : {}}>{t(`loyalty.tier.${tier.key}`, locale)}</span>
                          {isActive && <span className="text-[9px] font-normal text-muted-foreground">★</span>}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <motion.tr
                    key={row.key}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="p-3 sm:p-4 text-sm font-medium">{t(row.key, locale)}</td>
                    {(['bronze', 'silver', 'gold', 'platinum'] as TierKey[]).map((tk) => {
                      const has = row[tk];
                      const isCurrent = tk === currentTier.key;
                      return (
                        <td key={tk} className={`p-3 sm:p-4 text-center ${isCurrent ? 'bg-[#D4AF37]/5' : ''}`}>
                          {has ? (
                            <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-8"
        >
          <Button
            onClick={() => setPage('catalog')}
            className="bg-[#D4AF37] text-white hover:bg-[#B8960C] gap-2 px-8 py-6 text-base"
          >
            <ShoppingBag className="h-5 w-5" />
            {t('catalog.title', locale)}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">{t('loyalty.earn.purchaseDesc', locale)}</p>
        </motion.div>
      </div>
    </section>
  );
}
