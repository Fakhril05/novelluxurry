'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Star, Sparkles, BookOpen, Users, Bookmark, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Book } from '@/types';

interface HeroSectionProps {
  featuredBook: Book | null;
  onExplore: () => void;
  onViewBook: (book: Book) => void;
}

export default function HeroSection({ featuredBook, onExplore, onViewBook }: HeroSectionProps) {
  const locale = useAppStore((s) => s.locale);

  const formatBookPrice = (price: number) => {
    if (locale === 'en') {
      return `$${price.toFixed(2)}`;
    }
    return formatPrice(price, locale);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-banner.png"
          alt="Luxury bookstore interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Animated gradient orbs for depth */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-[100px] opacity-15 pointer-events-none z-[1]" />
      <div className="absolute bottom-20 -left-20 w-[400px] h-[400px] bg-[#C87533] rounded-full blur-[120px] opacity-10 pointer-events-none z-[1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E8D48B] rounded-full blur-[80px] opacity-[0.07] pointer-events-none z-[1]" />

      {/* Floating decorative icons */}
      <BookOpen className="absolute top-[15%] right-[12%] w-6 h-6 text-[#D4AF37] opacity-20 pointer-events-none z-[2]" style={{ animation: 'float 6s ease-in-out infinite' }} />
      <Star className="absolute top-[25%] left-[8%] w-5 h-5 text-[#D4AF37] opacity-15 pointer-events-none z-[2]" style={{ animation: 'float 5s ease-in-out 1s infinite' }} />
      <Sparkles className="absolute bottom-[30%] right-[18%] w-5 h-5 text-[#D4AF37] opacity-[0.18] pointer-events-none z-[2]" style={{ animation: 'float 7s ease-in-out 0.5s infinite' }} />
      <Bookmark className="absolute bottom-[40%] left-[15%] w-4 h-4 text-[#D4AF37] opacity-15 pointer-events-none z-[2]" style={{ animation: 'float 5.5s ease-in-out 2s infinite' }} />
      <Gem className="absolute top-[60%] right-[8%] w-4 h-4 text-[#F5E6A3] opacity-[0.12] pointer-events-none z-[2]" style={{ animation: 'float 6.5s ease-in-out 1.5s infinite' }} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text Side */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold-light">
                <Sparkles className="h-3.5 w-3.5" />
                {t('hero.badge', locale)}
              </div>

              <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
                {locale === 'en' ? (
                  <>
                    Where Every
                    <br />
                    <span className="gold-text-gradient">Story Matters</span>
                  </>
                ) : (
                  <>
                    <span className="gold-text-gradient">{t('hero.title', locale).split(' ').slice(0, Math.ceil(t('hero.title', locale).split(' ').length / 2)).join(' ')}</span>
                    <br />
                    {t('hero.title', locale).split(' ').slice(Math.ceil(t('hero.title', locale).split(' ').length / 2)).join(' ')}
                  </>
                )}
              </h1>

              <p className="mt-6 max-w-lg text-lg text-white/70 leading-relaxed mx-auto lg:mx-0">
                {t('hero.subtitle', locale)}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onExplore}
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-white h-12 px-8 text-base"
                >
                  {t('hero.cta1', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
                  onClick={onExplore}
                >
                  {t('hero.cta2', locale)}
                </Button>
              </div>

              {/* Stats with Animated Counters — Frosted Glass */}
              <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 inline-block">
                <div className="flex items-center gap-6 sm:gap-8 justify-center lg:justify-start">
                  <StatCounter icon={Users} value={10847} suffix="+" label={t('hero.readers', locale)} locale={locale} />
                  <div className="h-8 w-px bg-white/20" />
                  <StatCounter icon={BookOpen} value={524} suffix="+" label={t('hero.titles', locale)} locale={locale} />
                  <div className="h-8 w-px bg-white/20" />
                  <StatCounter icon={Star} value={4.9} suffix="" label={t('hero.rating', locale)} locale={locale} isRating />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Featured Book Card */}
          {featuredBook && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-shrink-0 hidden md:block"
            >
              <button
                onClick={() => onViewBook(featuredBook)}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 transition-all duration-300 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/10">
                  <div className="flex gap-4">
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-xl shrink-0">
                      <img
                        src={featuredBook.coverImage}
                        alt={featuredBook.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <p className="text-xs text-gold font-medium uppercase tracking-wider">{t('hero.featured', locale)}</p>
                        <h3 className="mt-1 font-heading text-lg font-bold text-white leading-tight line-clamp-2">
                          {featuredBook.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/60">by {featuredBook.author}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(featuredBook.rating)
                                  ? 'fill-gold text-gold'
                                  : 'text-white/20'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-white/50 ml-1">({featuredBook.reviewCount})</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gold">
                            {formatBookPrice(featuredBook.discountPrice ?? featuredBook.price)}
                          </span>
                          {featuredBook.discountPrice && (
                            <span className="text-sm text-white/40 line-through">
                              {formatBookPrice(featuredBook.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED STAT COUNTER
   ═══════════════════════════════════════════════════════════ */
function StatCounter({ icon: Icon, value, suffix, label, locale, isRating }: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  locale: 'id' | 'en';
  isRating?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const startVal = 0;

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startVal + (value - startVal) * eased;
            setDisplayValue(isRating ? Math.round(current * 10) / 10 : Math.round(current));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, isRating]);

  const formattedValue = isRating
    ? displayValue.toFixed(1)
    : value >= 1000
      ? `${(displayValue / 1000).toFixed(1)}K`
      : displayValue.toString();

  return (
    <div ref={ref} className="text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-1.5">
        <Icon className="h-4 w-4 text-[#D4AF37]/70" />
        <p className="text-2xl font-bold text-white">
          {isRating ? '' : ''}{formattedValue}{suffix}
        </p>
      </div>
      <p className="text-sm text-white/50 mt-0.5">{label}</p>
    </div>
  );
}
