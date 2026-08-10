'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Star,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Award,
  Tag,
  Gift,
  Quote,
  Clock,
  Eye,
  Crown,
  BookMarked,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import BookCard from '@/components/BookCard';
import type { Book, Category, Testimonial } from '@/types';
import { toast } from 'sonner';

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      custom={0}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
    >
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">{subtitle}</p>
      </div>
      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all shrink-0 h-10 px-5"
        >
          {action.label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HORIZONTAL SCROLL ROW  (Bestsellers / New Arrivals)
   ═══════════════════════════════════════════════════════════ */
function HorizontalBookRow({
  books,
  title,
  subtitle,
  viewAllLabel,
  onViewAll,
}: {
  books: Book[];
  title: string;
  subtitle: string;
  viewAllLabel: string;
  onViewAll: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (books.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          action={{ label: viewAllLabel, onClick: onViewAll }}
        />
      </div>

      <div className="relative group/row">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-lg opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] hidden sm:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border shadow-lg opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] hidden sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
        >
          {books.map((book, i) => (
            <div key={book.id} className="w-[180px] sm:w-[200px] shrink-0 snap-start">
              <BookCard book={book} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { locale, setPage, recentlyViewed: storeRecentlyViewed } = useAppStore();

  // ── Data state ──
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Book[]>([]);
  const [editorPicks, setEditorPicks] = useState<Book[]>([]);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [recommendBasedOnCategory, setRecommendBasedOnCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Testimonial carousel auto-play index ──
  const [activeIdx, setActiveIdx] = useState(0);

  // ── Newsletter input ──
  const [email, setEmail] = useState('');

  // ── Fetch recently viewed books ──
  const fetchRecentlyViewed = useCallback(async () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('noveluxe-recently-viewed') || '[]');
      if (ids.length === 0) return;
      const res = await fetch('/api/books?limit=20');
      if (res.ok) {
        const data = await res.json();
        const allBooks = data.books || [];
        const viewed = ids
          .map((id) => allBooks.find((b: Book) => b.id === id))
          .filter(Boolean) as Book[];
        setRecentlyViewed(viewed.slice(0, 8));
      }
    } catch { /* ignore */ }
  }, []);

  // Listen for recently-viewed updates from other components
  useEffect(() => {
    const handler = () => fetchRecentlyViewed();
    window.addEventListener('recently-viewed-updated', handler);
    return () => window.removeEventListener('recently-viewed-updated', handler);
  }, [fetchRecentlyViewed]);

  // ── Fetch recommendations ──
  const fetchRecommendations = useCallback(async () => {
    try {
      const ids = storeRecentlyViewed.length > 0 ? storeRecentlyViewed.slice(0, 10) : [];
      // Find the most recent book's category from the store's recently viewed
      let categoryId: string | null = null;
      // We'll determine category after books are loaded
      const params = new URLSearchParams();
      if (ids.length > 0) {
        params.set('exclude', ids.join(','));
      }
      params.set('limit', '8');
      const res = await fetch(`/api/books/recommendations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecommended(data.books || []);
      }
    } catch { /* ignore */ }
  }, [storeRecentlyViewed]);

  // ── Fetch data ──
  useEffect(() => {
    async function fetchData() {
      try {
        const [booksRes, catsRes, testRes, picksRes] = await Promise.all([
          fetch('/api/books?limit=16'),
          fetch('/api/categories'),
          fetch('/api/testimonials'),
          fetch('/api/books?minRating=4.8&sort=rating&limit=4'),
        ]);
        if (!booksRes.ok || !catsRes.ok || !testRes.ok) throw new Error('Fetch failed');
        const [booksData, catsData, testData, picksData] = await Promise.all([
          booksRes.json(),
          catsRes.json(),
          testRes.json(),
          picksRes.ok ? picksRes.json() : { books: [] },
        ]);
        const loadedBooks = booksData.books || [];
        setBooks(loadedBooks);
        setCategories(catsData);
        setTestimonials(testData);
        setEditorPicks(picksData.books || []);

        // Determine recommendation category from store's recentlyViewed
        if (storeRecentlyViewed.length > 0) {
          const mostRecentBook = loadedBooks.find((b: Book) => b.id === storeRecentlyViewed[0]);
          if (mostRecentBook?.categoryId) {
            setRecommendBasedOnCategory(true);
            const params = new URLSearchParams();
            params.set('categoryId', mostRecentBook.categoryId);
            params.set('exclude', storeRecentlyViewed.slice(0, 10).join(','));
            params.set('limit', '8');
            const recRes = await fetch(`/api/books/recommendations?${params.toString()}`);
            if (recRes.ok) {
              const recData = await recRes.json();
              setRecommended(recData.books || []);
            }
          } else {
            // No category match, fetch diverse recommendations
            const params = new URLSearchParams();
            if (storeRecentlyViewed.length > 0) {
              params.set('exclude', storeRecentlyViewed.slice(0, 10).join(','));
            }
            params.set('limit', '8');
            const recRes = await fetch(`/api/books/recommendations?${params.toString()}`);
            if (recRes.ok) {
              const recData = await recRes.json();
              setRecommended(recData.books || []);
            }
          }
        } else {
          // No recently viewed, fetch diverse recommendations
          const recRes = await fetch('/api/books/recommendations?limit=8');
          if (recRes.ok) {
            const recData = await recRes.json();
            setRecommended(recData.books || []);
          }
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    fetchRecentlyViewed();
  }, [fetchRecentlyViewed, storeRecentlyViewed]);

  // ── Auto-play testimonial carousel ──
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ── Derived data ──
  const bestsellers = books.filter((b) => b.isBestSeller);
  const newArrivals = books.filter((b) => b.isNewArrival);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
          <p className="text-muted-foreground text-sm">{t('general.loading', locale)}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* ────────────────────────────────────────────────────
          1. HERO SECTION
          ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop"
            alt="Luxury library"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Radial gradient glow behind text */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 35% 40%, rgba(212,175,55,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Floating gold particles */}
        <div className="absolute top-[15%] left-[10%] z-[2] h-2 w-2 rounded-full bg-[#D4AF37]/40 animate-float-subtle" />
        <div className="absolute top-[25%] right-[20%] z-[2] h-1.5 w-1.5 rounded-full bg-[#D4AF37]/30 animate-float-subtle [animation-delay:0.5s]" />
        <div className="absolute top-[60%] left-[8%] z-[2] h-1 w-1 rounded-full bg-[#E8D48B]/50 animate-float-subtle [animation-delay:1s]" />
        <div className="absolute top-[70%] right-[15%] z-[2] h-2.5 w-2.5 rounded-full bg-[#D4AF37]/25 animate-float-subtle [animation-delay:1.5s]" />
        <div className="absolute top-[40%] right-[35%] z-[2] h-1.5 w-1.5 rounded-full bg-[#D4AF37]/35 animate-float-subtle [animation-delay:2s]" />
        <div className="absolute top-[80%] left-[25%] z-[2] h-1 w-1 rounded-full bg-[#E8D48B]/40 animate-float-subtle [animation-delay:0.8s]" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="max-w-2xl rounded-2xl border border-[#D4AF37]/15 p-6 sm:p-8 bg-black/10 backdrop-blur-[2px]">
              {/* Gold pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-sm text-[#E8D48B]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Noveluxe
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]"
              >
                {t('hero.title', locale)}
              </motion.h1>

              {/* Decorative gold line divider */}
              <div className="mt-5 w-16 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-4 max-w-xl text-lg text-white/70 leading-relaxed"
              >
                {t('hero.subtitle', locale)}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => setPage('catalog')}
                  className="bg-[#D4AF37] hover:bg-[#B8960C] text-white h-12 px-8 text-base font-semibold shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.55)] transition-all"
                >
                  {t('hero.cta1', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage('catalog')}
                  className="border-[#D4AF37]/50 text-[#E8D48B] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] h-12 px-8 text-base transition-all"
                >
                  {t('hero.cta2', locale)}
                </Button>
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-8 flex items-center gap-8 sm:gap-10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20">
                    <Users className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">10K+</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-wider">{locale === 'id' ? 'Pembaca' : 'Readers'}</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20">
                    <BookOpen className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">500+</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-wider">{locale === 'id' ? 'Judul' : 'Titles'}</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20">
                    <Star className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">4.9</p>
                    <p className="text-[11px] text-white/50 uppercase tracking-wider">{locale === 'id' ? 'Rating' : 'Rating'}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────
          2. CATEGORIES SECTION
          ──────────────────────────────────────────────────── */}
      <CategoriesSection categories={categories} locale={locale} />

      {/* ────────────────────────────────────────────────────
          2.5 EDITOR'S PICK SECTION
          ──────────────────────────────────────────────────── */}
      {editorPicks.length > 0 && (
        <EditorsPickSection books={editorPicks} locale={locale} />
      )}

      {/* ────────────────────────────────────────────────────
          3. BESTSELLERS SECTION
          ──────────────────────────────────────────────────── */}
      <HorizontalBookRow
        books={bestsellers}
        title={t('bestseller.title', locale)}
        subtitle={t('bestseller.subtitle', locale)}
        viewAllLabel={t('bestseller.viewAll', locale)}
        onViewAll={() => setPage('catalog', { sort: 'bestseller' })}
      />

      {/* ────────────────────────────────────────────────────
          4. NEW ARRIVALS SECTION
          ──────────────────────────────────────────────────── */}
      <HorizontalBookRow
        books={newArrivals}
        title={t('newArrival.title', locale)}
        subtitle={t('newArrival.subtitle', locale)}
        viewAllLabel={t('general.viewAll', locale)}
        onViewAll={() => setPage('catalog', { sort: 'newest' })}
      />

      {/* ────────────────────────────────────────────────────
          4.5 RECOMMENDED FOR YOU (Buku Untukmu)
          ──────────────────────────────────────────────────── */}
      <RecommendedSection
        locale={locale}
        recommended={recommended}
        basedOnCategory={recommendBasedOnCategory}
        onRefresh={fetchRecommendations}
      />

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <HorizontalBookRow
          books={recentlyViewed}
          title={locale === "id" ? "Terakhir Dilihat" : "Recently Viewed"}
          subtitle={locale === "id" ? "Buku yang baru saja kamu lihat" : "Books you recently viewed"}
          viewAllLabel={t("general.viewAll", locale)}
          onViewAll={() => setPage("catalog")}
        />
      )}

      {/* ────────────────────────────────────────────────────
          5. PROMO BANNER
          ──────────────────────────────────────────────────── */}
      <PromoBanner locale={locale} />

      {/* ────────────────────────────────────────────────────
          6. TESTIMONIALS SECTION
          ──────────────────────────────────────────────────── */}
      <TestimonialsSection
        testimonials={testimonials}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        locale={locale}
      />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   RECOMMENDED FOR YOU SECTION (Buku Untukmu)
   ═══════════════════════════════════════════════════════════ */
function RecommendedSection({
  locale,
  recommended,
  basedOnCategory,
  onRefresh,
}: {
  locale: 'id' | 'en';
  recommended: Book[];
  basedOnCategory: boolean;
  onRefresh: () => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
    toast.success(t('recommend.refreshed', locale));
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  if (recommended.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header with Sparkles + refresh */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                {t('recommend.title', locale)}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              {t('recommend.subtitle', locale)}
            </p>
            {basedOnCategory && (
              <Badge
                variant="outline"
                className="mt-2 border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 text-xs"
              >
                {t('recommend.basedOn', locale)}: {t('recommend.basedOnCategory', locale)}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all shrink-0 h-9 px-4"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {t('recommend.refresh', locale)}
          </Button>
        </motion.div>
      </div>

      {/* Book row */}
      <div className="relative group/row">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommended.map((book, i) => (
            <motion.div
              key={book.id}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeUp}
              custom={i}
              className="shrink-0 w-[180px] sm:w-[200px] md:w-[210px] snap-start"
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent hidden md:block" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent hidden md:block" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORIES SECTION COMPONENT
   ═══════════════════════════════════════════════════════════ */
function CategoriesSection({
  categories,
  locale,
}: {
  categories: Category[];
  locale: 'id' | 'en';
}) {
  const { setPage } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  if (categories.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t('categories.title', locale)}
          subtitle={t('categories.subtitle', locale)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={fadeUp}
              custom={i}
              onClick={() => setPage('catalog', { genre: cat.slug })}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              aria-label={`Browse ${cat.name}`}
            >
              {/* Category image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={cat.image || '/images/category-placeholder.jpg'}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 transition-colors duration-300" />
              </div>

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h3 className="font-heading text-sm sm:text-base font-bold text-white leading-tight">
                  {locale === 'en' && cat.nameEn ? cat.nameEn : cat.name}
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  {cat._count?.books || 0} {locale === 'id' ? 'buku' : 'books'}
                </p>
              </div>

              {/* Gold accent line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[#D4AF37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDITOR'S PICK SECTION COMPONENT
   ═══════════════════════════════════════════════════════════ */
const EDITOR_QUOTES = [
  'editorsPick.quote1',
  'editorsPick.quote2',
  'editorsPick.quote3',
  'editorsPick.quote4',
];

function EditorsPickSection({
  books,
  locale,
}: {
  books: Book[];
  locale: 'id' | 'en';
}) {
  const { setPage } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const mainPick = books[0];
  const sidePicks = books.slice(1, 4);

  if (!mainPick) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20 relative overflow-hidden">
      {/* Subtle gold background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-sm text-[#D4AF37] mb-4">
            <Crown className="h-3.5 w-3.5" />
            {t('editorsPick.mainPick', locale)}
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            {t('editorsPick.title', locale)}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            {t('editorsPick.subtitle', locale)}
          </p>
        </motion.div>

        {/* Layout: main pick (left) + side picks (right column) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Pick Card */}
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-3"
          >
            <div
              className="group relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]/20 bg-card cursor-pointer transition-all duration-500 hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1"
              onClick={() => setPage('book-detail', { slug: mainPick.slug })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPage('book-detail', { slug: mainPick.slug });
                }
              }}
              aria-label={`View details for ${mainPick.title}`}
            >
              {/* Gold shimmer overlay on hover */}
              <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(212,175,55,0.06) 45%, rgba(212,175,55,0.12) 50%, rgba(212,175,55,0.06) 55%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out',
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Cover image */}
                <div className="relative aspect-[2/3] sm:aspect-auto overflow-hidden">
                  <img
                    src={mainPick.coverImage}
                    alt={mainPick.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 hidden sm:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />

                  {/* Award badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1.5 shadow-lg shadow-[#D4AF37]/30">
                      <Award className="h-4 w-4 text-white" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                        #1 {t('editorsPick.mainPick', locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info area */}
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  {mainPick.category && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D4AF37] mb-2">
                      {mainPick.category.name}
                    </p>
                  )}
                  <h3 className="font-heading text-xl sm:text-2xl font-bold leading-snug text-foreground group-hover:text-[#D4AF37] transition-colors duration-300">
                    {mainPick.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{mainPick.author}</p>

                  {/* Stars */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(mainPick.rating)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-muted-foreground/25'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium text-foreground">
                      {mainPick.rating}
                    </span>
                  </div>

                  {/* Editor's quote */}
                  <div className="mt-4 sm:mt-6">
                    <div className="relative">
                      <Quote className="absolute -top-1 -left-1 h-5 w-5 text-[#D4AF37]/20" />
                      <p className="pl-5 text-sm text-muted-foreground leading-relaxed italic">
                        &ldquo;{t(EDITOR_QUOTES[0], locale)}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(mainPick.discountPrice || mainPick.price, locale)}
                    </span>
                    {mainPick.discountPrice && (
                      <span className="text-sm text-muted-foreground/60 line-through">
                        {formatPrice(mainPick.price, locale)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] group-hover:gap-2.5 transition-all duration-300">
                      {t('editorsPick.viewDetail', locale)}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side Picks Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sidePicks.map((book, i) => (
              <motion.div
                key={book.id}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                variants={fadeUp}
                custom={i + 2}
              >
                <div
                  className="group relative flex gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-lg hover:shadow-[#D4AF37]/5"
                  onClick={() => setPage('book-detail', { slug: book.slug })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPage('book-detail', { slug: book.slug });
                    }
                  }}
                  aria-label={`View details for ${book.title}`}
                >
                  {/* Rank badge */}
                  <div className="absolute -top-2 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-md shadow-[#D4AF37]/30">
                    #{i + 2}
                  </div>

                  {/* Cover */}
                  <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-heading text-sm sm:text-base font-bold leading-snug line-clamp-2 text-foreground group-hover:text-[#D4AF37] transition-colors duration-300">
                        {book.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {book.author}
                      </p>
                    </div>

                    {/* Editor quote (truncated) */}
                    <p className="text-[11px] text-muted-foreground/70 line-clamp-2 mt-1 italic">
                      &ldquo;{t(EDITOR_QUOTES[i + 1], locale)}&rdquo;
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3 w-3 ${
                              j < Math.floor(book.rating)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-muted-foreground/25'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {book.rating}
                      </span>
                      <span className="text-xs font-bold text-foreground ml-auto">
                        {formatPrice(book.discountPrice || book.price, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROMO BANNER COMPONENT
   ═══════════════════════════════════════════════════════════ */
function PromoBanner({ locale }: { locale: 'id' | 'en' }) {
  const { setPage } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    toast.success(locale === 'id' ? 'Kode berhasil disalin!' : 'Code copied!');
  };

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Gradient border wrapper with glow */}
        <div className="relative rounded-[1.6rem] p-[2px] bg-gradient-to-br from-[#D4AF37] via-[#E8D48B] to-[#B8960C] shadow-[0_0_50px_rgba(212,175,55,0.3)]">
          {/* Glass effect outer ring */}
          <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5 blur-xl pointer-events-none" />
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeIn}
          custom={0}
          className="relative overflow-hidden rounded-[calc(1.6rem-2px)]"
        >
          {/* Gold gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#E8D48B] to-[#B8960C]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left - Icon & Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 mb-4">
                <Gift className="h-4 w-4 text-white" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  {t('promo.title', locale)}
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
                {t('promo.subtitle', locale)}
              </h2>
              <p className="mt-3 text-white/80 text-sm sm:text-base max-w-md mx-auto md:mx-0">
                {t('promo.desc', locale)}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => setPage('catalog')}
                  className="bg-black text-white hover:bg-black/80 h-12 px-8 text-base font-semibold transition-all"
                >
                  {t('hero.cta1', locale)}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Promo code */}
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-white/50 bg-black/10 px-5 py-3 transition-all hover:border-white/80 hover:bg-black/20 group cursor-pointer"
                >
                  <Tag className="h-4 w-4 text-white/80" />
                  <span className="text-base sm:text-lg font-mono font-bold text-white tracking-wider">
                    WELCOME10
                  </span>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider group-hover:text-white/80 transition-colors">
                    {locale === 'id' ? 'Salin' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right - Decorative element */}
            <div className="hidden md:flex items-center justify-center shrink-0">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center animate-pulse-gold">
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-white">10%</p>
                      <p className="text-xs text-white/80 font-semibold uppercase tracking-wider mt-1">
                        {t('promo.code', locale)}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decorative rings */}
                <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-white/10" />
                <div className="absolute -bottom-2 -left-2 h-6 w-6 rounded-full bg-white/10" />
                <div className="absolute top-1/2 -right-8 h-4 w-4 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS SECTION COMPONENT
   ═══════════════════════════════════════════════════════════ */
function TestimonialsSection({
  testimonials,
  activeIdx,
  setActiveIdx,
  locale,
}: {
  testimonials: Testimonial[];
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
  locale: 'id' | 'en';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  if (testimonials.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          custom={0}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            {t('testimonial.title', locale)}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            {t('testimonial.subtitle', locale)}
          </p>
        </motion.div>

        {/* Desktop: Carousel with shadcn */}
        <div className="hidden md:block">
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeIn}
            custom={1}
            className="relative"
          >
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((test) => (
                  <CarouselItem key={test.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <TestimonialCard testimonial={test} locale={locale} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-14 bg-background border-border hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]" />
              <CarouselNext className="-right-14 bg-background border-border hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]" />
            </Carousel>
          </motion.div>
        </div>

        {/* Mobile: Single card with dots */}
        <div className="md:hidden">
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeIn}
            custom={1}
          >
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIdx * 100}%)` }}
              >
                {testimonials.map((test) => (
                  <div key={test.id} className="w-full shrink-0 px-1">
                    <TestimonialCard testimonial={test} locale={locale} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === activeIdx
                      ? 'w-8 bg-[#D4AF37]'
                      : 'w-2.5 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SINGLE TESTIMONIAL CARD
   ═══════════════════════════════════════════════════════════ */
function TestimonialCard({
  testimonial,
  locale,
}: {
  testimonial: Testimonial;
  locale: 'id' | 'en';
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5">
      {/* Quote icon */}
      <Quote className="h-8 w-8 text-[#D4AF37]/20 mb-4" />

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'text-muted-foreground/25'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-sm sm:text-base text-foreground/80 leading-relaxed line-clamp-4 mb-6">
        &ldquo;{testimonial.comment}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-[#D4AF37]/20">
          <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
          <AvatarFallback className="bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold">
            {testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">
            {locale === 'id' ? 'Pembaca Noveluxe' : 'Noveluxe Reader'}
          </p>
        </div>
      </div>
    </div>
  );
}
