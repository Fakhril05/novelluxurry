'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  BookOpen,
  Calendar,
  Building,
  Globe,
  Hash,
  AlertCircle,
  Twitter,
  Facebook,
  Link as LinkIcon,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppStore, formatPrice } from '@/lib/store';
import { useCartStore } from '@/lib/cart-store';
import { t } from '@/lib/i18n';
import BookCard from '@/components/BookCard';
import type { Book } from '@/types';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  createdAt: string;
}

type FormatOption = 'Hardcover' | 'Paperback' | 'Ebook';

const FORMAT_OPTIONS: FormatOption[] = ['Hardcover', 'Paperback', 'Ebook'];

const FORMAT_PRICE_MULTIPLIER: Record<FormatOption, number> = {
  Hardcover: 1.2,
  Paperback: 1,
  Ebook: 0.7,
};

/** Generate simulated rating distribution from average */
function getRatingDistribution(avgRating: number, totalReviews: number) {
  // Create a bell-curve-like distribution based on the average rating
  const base = totalReviews || 1;
  const dist: number[] = [0, 0, 0, 0, 0]; // 5★, 4★, 3★, 2★, 1★
  for (let i = 0; i < 5; i++) {
    const starVal = 5 - i;
    const diff = Math.abs(starVal - avgRating);
    dist[i] = Math.max(5, Math.round(base * Math.exp(-diff * diff * 0.5)));
  }
  // Normalize so sum matches totalReviews
  const sum = dist.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 5; i++) {
    dist[i] = Math.round((dist[i] / sum) * base);
  }
  return dist;
}

export default function BookDetailPage() {
  const {
    pageParams,
    locale,
    setPage,
    isAuthenticated,
    user,
    wishlist,
    toggleWishlist,
  } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);

  const slug = pageParams.slug;

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>('Paperback');
  const [activeTab, setActiveTab] = useState('synopsis');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewsRef = useRef<HTMLDivElement>(null);

  // Parse gallery images from JSON string
  const galleryImages: string[] = (() => {
    if (!book?.galleryImages) return [];
    try {
      const parsed = JSON.parse(book.galleryImages);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  // All images including cover as first
  const allImages = book ? [book.coverImage, ...galleryImages] : [];

  // Computed price based on format
  const effectivePrice = book
    ? Math.round(
        (book.discountPrice ?? book.price) * FORMAT_PRICE_MULTIPLIER[selectedFormat]
      )
    : 0;

  const hasDiscount = book ? !!book.discountPrice && book.discountPrice < book.price : false;
  const discountPercent = book
    ? Math.round((1 - (book.discountPrice ?? book.price) / book.price) * 100)
    : 0;
  const isWished = book ? wishlist.includes(book.id) : false;

  // Rating distribution
  const ratingDistribution = useMemo(
    () => getRatingDistribution(book?.rating ?? 0, reviews.length),
    [book?.rating, reviews.length]
  );

  const fetchBook = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      const res = await fetch(`/api/books/${slug}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch book');
      const data = await res.json();
      const bookData = data.book || data;
      setBook(bookData);
      setReviews(data.reviews || []);

      // Track recently viewed
      if (bookData?.id) {
        try {
          let ids: string[] = JSON.parse(localStorage.getItem('noveluxe-recently-viewed') || '[]');
          ids = ids.filter((id: string) => id !== bookData.id);
          ids.unshift(bookData.id);
          ids = ids.slice(0, 8);
          localStorage.setItem('noveluxe-recently-viewed', JSON.stringify(ids));
        } catch { /* ignore */ }
      }

      // Fetch recommendations
      if (data.book?.categoryId || data?.categoryId) {
        const catId = data.book?.categoryId || data?.categoryId;
        const recRes = await fetch(`/api/books?limit=8&genre=${catId}`, {
          signal: controller.signal,
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          const recBooks = (recData.books || recData || []).filter(
            (b: Book) => b.slug !== slug
          );
          setRecommendations(recBooks.slice(0, 8));
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(locale === 'id' ? 'Gagal memuat detail buku' : 'Failed to load book details');
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [slug, locale]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  // Reset state when slug changes
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedFormat('Paperback');
    setActiveTab('synopsis');
    setReviewRating(0);
    setReviewComment('');
  }, [slug]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book);
    toast.success(
      locale === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart',
      {
        description: book.title,
      }
    );
  };

  const handleBuyNow = () => {
    if (!book) return;
    addItem(book);
    setPage('checkout');
  };

  const handleWishlist = () => {
    if (!book) return;
    toggleWishlist(book.id);
  };

  const handleScrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmitReview = async () => {
    if (!book || reviewRating === 0) {
      toast.error(locale === 'id' ? 'Pilih rating terlebih dahulu' : 'Please select a rating first');
      return;
    }
    if (!user) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
          userId: user.id,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        toast.success(t('book.reviewSuccess', locale));

        // Append new review to the displayed list
        const newReview: Review = {
          id: result.review.id,
          rating: result.review.rating,
          comment: result.review.comment,
          userId: result.review.userId,
          user: {
            id: user.id,
            name: user.name,
            avatar: null,
          },
          createdAt: result.review.createdAt,
        };
        setReviews((prev) => [newReview, ...prev]);

        // Update book rating display
        setBook((prev) => {
          if (!prev) return prev;
          const newReviewCount = prev.reviewCount + 1;
          const newAvgRating = Math.round(
            ((prev.rating * prev.reviewCount + reviewRating) / newReviewCount) * 10
          ) / 10;
          return { ...prev, rating: newAvgRating, reviewCount: newReviewCount };
        });

        // Reset form
        setReviewRating(0);
        setReviewComment('');
      } else {
        toast.error(locale === 'id' ? 'Gagal mengirim ulasan' : 'Failed to submit review');
      }
    } catch {
      toast.error(locale === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = book?.title ?? '';
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          toast.success(locale === 'id' ? 'Link berhasil disalin!' : 'Link copied!');
        });
        break;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ---- Loading Skeleton ----
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          {/* Two column skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: cover */}
            <div className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full max-w-md mx-auto rounded-xl" />
              <div className="flex gap-3 justify-center">
                <Skeleton className="h-20 w-16 rounded-lg" />
                <Skeleton className="h-20 w-16 rounded-lg" />
                <Skeleton className="h-20 w-16 rounded-lg" />
              </div>
            </div>
            {/* Right: info */}
            <div className="space-y-5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (error || !book) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
          <h2 className="font-heading text-2xl font-bold">
            {error || (locale === 'id' ? 'Buku tidak ditemukan' : 'Book not found')}
          </h2>
          <Button
            onClick={() => setPage('catalog')}
            className="bg-[#D4AF37] hover:bg-[#B8960C] text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('general.back', locale)}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ---- Main Content ----
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-6 px-4 sm:py-10"
    >
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-14">
        {/* Back button (mobile) */}
        <button
          onClick={() => setPage('catalog')}
          className="lg:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('general.back', locale)}
        </button>

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => setPage('home')}
                className="cursor-pointer text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                {t('nav.home', locale)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => setPage('catalog')}
                className="cursor-pointer text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                {t('nav.catalog', locale)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium truncate max-w-[200px]">
                {book.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* ---- Left Column: Cover Gallery ---- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main cover image */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] bg-secondary">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={allImages[selectedImage] || book.coverImage}
                  alt={book.title}
                  className="w-full aspect-[3/4] object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {book.isBestSeller && (
                  <Badge className="bg-[#D4AF37] text-white border-0 text-xs font-bold uppercase tracking-wider px-3 py-1 shadow-lg">
                    {t('badge.bestseller', locale)}
                  </Badge>
                )}
                {book.isNewArrival && (
                  <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold uppercase tracking-wider px-3 py-1 shadow-lg">
                    {t('badge.new', locale)}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-3 py-1 shadow-lg">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 justify-center flex-wrap">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                      selectedImage === idx
                        ? 'border-[#D4AF37] shadow-md shadow-[#D4AF37]/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${book.title} - ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ---- Right Column: Info ---- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 glass-card backdrop-blur-sm border border-[#D4AF37]/10 rounded-2xl p-6"
          >
            {/* Badges (desktop duplicates for mobile visibility) */}
            <div className="flex items-center gap-2 flex-wrap">
              {book.isBestSeller && (
                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold px-3 py-1">
                  {t('badge.bestseller', locale)}
                </Badge>
              )}
              {book.isNewArrival && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1">
                  {t('badge.new', locale)}
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-semibold px-3 py-1">
                  -{discountPercent}% {t('badge.discount', locale)}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gradient-gold">
              {book.title}
            </h1>

            {/* Author */}
            <p className="text-lg text-muted-foreground">{book.author}</p>

            {/* Rating */}
            <button
              onClick={handleScrollToReviews}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md"
              aria-label={`Scroll to reviews, ${book.rating} out of 5`}
            >
              <div className="flex items-center dark:drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 transition-colors dark:drop-shadow-[0_0_3px_rgba(212,175,55,0.3)] ${
                      i < Math.floor(book.rating)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : i < book.rating
                        ? 'fill-[#D4AF37]/50 text-[#D4AF37]'
                        : 'text-muted-foreground/30 dark:text-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                {book.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-[#D4AF37] transition-colors">
                ({book.reviewCount} {locale === 'id' ? 'ulasan' : 'reviews'})
              </span>
            </button>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(effectivePrice, locale)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(
                    Math.round(book.price * FORMAT_PRICE_MULTIPLIER[selectedFormat]),
                    locale
                  )}
                </span>
              )}
            </div>

            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('book.format', locale)}
              </label>
              <div className="flex gap-2 flex-wrap">
                {FORMAT_OPTIONS.map((fmt) => {
                  const isActive = selectedFormat === fmt;
                  const fmtPrice = Math.round(
                    (book.discountPrice ?? book.price) * FORMAT_PRICE_MULTIPLIER[fmt]
                  );
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                        isActive
                          ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37] shadow-md shadow-[#D4AF37]/15'
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-[#D4AF37]/40 hover:text-foreground'
                      }`}
                      aria-pressed={isActive}
                    >
                      {fmt}
                      <span
                        className={`text-xs ${
                          isActive ? 'text-[#D4AF37]/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatPrice(fmtPrice, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  book.stock > 0
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-red-500'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  book.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {book.stock > 0
                  ? `${t('book.stock', locale)} (${book.stock})`
                  : locale === 'id'
                  ? 'Stok habis'
                  : 'Out of stock'}
              </span>
              {book.soldCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  · {book.soldCount} {t('book.sold', locale)}
                </span>
              )}
            </div>

            {/* Gold Gradient Divider */}
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(to right, transparent, #D4AF37, rgba(212,175,55,0.3), transparent)',
              }}
            />

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground">
                {locale === 'id' ? 'Jumlah' : 'Quantity'}
              </label>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(book.stock || 99, q + 1))}
                  disabled={quantity >= (book.stock || 99)}
                  className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={book.stock <= 0}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8960C] text-white font-semibold h-12 text-base rounded-xl shadow-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('book.addCart', locale)}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={book.stock <= 0}
                variant="outline"
                className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-semibold h-12 text-base rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('book.buyNow', locale)}
              </Button>
              <Button
                onClick={handleWishlist}
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-xl border-2 transition-all duration-200 shrink-0 ${
                  isWished
                    ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    : 'border-border text-muted-foreground hover:border-red-500/50 hover:text-red-500'
                }`}
                aria-label={t('book.wishlist', locale)}
              >
                <Heart className={`h-5 w-5 ${isWished ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Gold Gradient Divider */}
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(to right, transparent, #D4AF37, rgba(212,175,55,0.3), transparent)',
              }}
            />

            {/* Book Meta Grid with gold left borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {book.pages && (
                <div className="flex items-start gap-3 text-sm border-l-2 border-[#D4AF37]/40 pl-3 py-1">
                  <BookOpen className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {t('book.pages', locale)}
                    </p>
                    <p className="font-medium">{book.pages}</p>
                  </div>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-start gap-3 text-sm border-l-2 border-[#D4AF37]/40 pl-3 py-1">
                  <Building className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {t('book.publisher', locale)}
                    </p>
                    <p className="font-medium truncate max-w-[160px]">{book.publisher}</p>
                  </div>
                </div>
              )}
              {book.publishedYear && (
                <div className="flex items-start gap-3 text-sm border-l-2 border-[#D4AF37]/40 pl-3 py-1">
                  <Calendar className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {t('book.year', locale)}
                    </p>
                    <p className="font-medium">{book.publishedYear}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm border-l-2 border-[#D4AF37]/40 pl-3 py-1">
                <Globe className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t('book.language', locale)}
                  </p>
                  <p className="font-medium">{book.language}</p>
                </div>
              </div>
              {book.isbn && (
                <div className="flex items-start gap-3 text-sm border-l-2 border-[#D4AF37]/40 pl-3 py-1">
                  <Hash className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs">ISBN</p>
                    <p className="font-medium text-xs truncate max-w-[160px]">{book.isbn}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gold Gradient Divider */}
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(to right, transparent, #D4AF37, rgba(212,175,55,0.3), transparent)',
              }}
            />

            {/* Share Row */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-medium text-muted-foreground shrink-0">
                {t('book.share', locale)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-[#1DA1F2] hover:border-[#1DA1F2]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-[#1877F2] hover:border-[#1877F2]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-[#25D366] hover:border-[#25D366]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                  aria-label="Copy link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ---- Tabs Section ---- */}
        <motion.div
          ref={reviewsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Custom Tab Navigation */}
          <div className="w-full">
            <div className="w-full flex justify-start bg-muted/50 h-auto p-1 rounded-xl border border-border overflow-x-auto relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" aria-hidden="true" />
              {['synopsis', 'author', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                    activeTab === tab
                      ? 'text-[#D4AF37] bg-transparent after:content-[\'\'] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:rounded-full after:bg-[#D4AF37]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'synopsis' && t('book.synopsis', locale)}
                  {tab === 'author' && t('book.author', locale)}
                  {tab === 'reviews' && `${t('book.reviews', locale)} (${reviews.length})`}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="mt-6">
              {activeTab === 'synopsis' && (
                <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                  {book.synopsis ? (
                    <div className="prose prose-sm sm:prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                      {book.synopsis}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {locale === 'id'
                        ? 'Sinopsis belum tersedia untuk buku ini.'
                        : 'Synopsis is not yet available for this book.'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'author' && (
                <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                  {book.authorBio ? (
                    <div className="prose prose-sm sm:prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                      {book.authorBio}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {locale === 'id'
                        ? 'Informasi penulis belum tersedia.'
                        : 'Author information is not yet available.'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
              {/* Rating Distribution Summary */}
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  {/* Left: Overall Rating */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <p className="text-5xl font-bold text-foreground">{book.rating.toFixed(1)}</p>
                    <div className="flex items-center mt-1.5 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(book.rating)
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : i < book.rating
                              ? 'fill-[#D4AF37]/50 text-[#D4AF37]'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {reviews.length} {locale === 'id' ? 'ulasan' : 'reviews'}
                    </p>
                  </div>
                  {/* Right: Rating Bars */}
                  <div className="flex-1 space-y-2">
                    {ratingDistribution.map((count, idx) => {
                      const starVal = 5 - idx;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={starVal} className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-muted-foreground w-8 text-right">
                            {starVal}★
                          </span>
                          <div className="flex-1 h-2.5 rounded-full bg-muted/80 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                background: `linear-gradient(to right, #D4AF37, #B8960C)`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Gold gradient divider */}
              <div
                className="h-px w-full"
                style={{
                  background: 'linear-gradient(to right, transparent, #D4AF37, rgba(212,175,55,0.3), transparent)',
                }}
              />

              {/* Write Review Form (authenticated users only) */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[#D4AF37]/20 bg-card p-6 sm:p-8 space-y-5"
                >
                  <h3 className="font-heading text-lg font-semibold text-gradient-gold">
                    {t('book.writeReview', locale)}
                  </h3>
                  {/* Star selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('book.ratingLabel', locale)}
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setReviewRating(i + 1)}
                          onMouseEnter={() => {}}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm p-0.5 transition-transform hover:scale-110"
                          aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                        >
                          <Star
                            className={`h-7 w-7 transition-colors duration-150 ${
                              i < reviewRating
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-muted-foreground/30 hover:text-[#D4AF37]/50'
                            }`}
                          />
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm font-medium text-[#D4AF37]">
                          {reviewRating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Comment textarea */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('book.reviewLabel', locale)}
                    </label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setReviewComment(e.target.value);
                        }
                      }}
                      placeholder={t('book.reviewPlaceholder', locale)}
                      rows={4}
                      className="resize-none rounded-xl border-border focus-visible:ring-[#D4AF37]"
                    />
                    <div className="flex justify-end">
                      <span className={`text-xs ${reviewComment.length >= 500 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {reviewComment.length}/500
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="bg-[#D4AF37] hover:bg-[#B8960C] text-white font-semibold rounded-xl px-6 disabled:opacity-50"
                  >
                    {submittingReview
                      ? t('general.loading', locale)
                      : t('book.submitReview', locale)}
                  </Button>
                </motion.div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <Heart className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('book.loginToReview', locale)}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    onClick={() => setPage('login')}
                  >
                    {t('auth.login', locale)}
                  </Button>
                </div>
              )}

              {/* Gold gradient divider */}
              <div
                className="h-px w-full"
                style={{
                  background: 'linear-gradient(to right, transparent, #D4AF37, rgba(212,175,55,0.3), transparent)',
                }}
              />

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-heading font-bold text-sm">
                            {(review.user?.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {review.user?.name ||
                                (locale === 'id' ? 'Anonim' : 'Anonymous')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? 'fill-[#D4AF37] text-[#D4AF37]'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 rounded-xl border border-dashed border-border">
                    <Star className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">
                      {locale === 'id'
                        ? 'Belum ada ulasan untuk buku ini.'
                        : 'No reviews yet for this book.'}
                    </p>
                  </div>
                )}
              </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ---- Recommendations Section ---- */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6 pt-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-gradient-gold">
                  {t('book.recommendations', locale)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {locale === 'id'
                    ? 'Berdasarkan kategori yang sama'
                    : 'Based on the same category'}
                </p>
              </div>
              <button
                onClick={() => setPage('catalog')}
                className="text-sm font-medium text-[#D4AF37] hover:text-[#B8960C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-md px-3 py-1.5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
              >
                {t('general.viewAll', locale)} →
              </button>
            </div>
            {/* Gold divider */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(to right, #D4AF37, rgba(212,175,55,0.2), transparent)' }} />
            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory px-1">
              {recommendations.map((recBook, idx) => (
                <div key={recBook.id} className="w-[180px] sm:w-[200px] shrink-0 snap-start">
                  <BookCard book={recBook} index={idx} />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
