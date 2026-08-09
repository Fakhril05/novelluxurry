'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  X,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import BookCard from '@/components/BookCard';
import type { Book } from '@/types';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { locale, wishlist, toggleWishlist, setPage } = useAppStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const fetchWishlistBooks = useCallback(async () => {
    if (wishlist.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      const allBooks: Book[] = data.books || [];
      // Filter to only wishlisted books, preserving order from wishlist
      const wishlistedBooks = wishlist
        .map((id) => allBooks.find((b: Book) => b.id === id))
        .filter((b): b is Book => !!b);
      setBooks(wishlistedBooks);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    fetchWishlistBooks();
  }, [fetchWishlistBooks]);

  const handleRemoveFromWishlist = (bookId: string, bookTitle: string) => {
    toggleWishlist(bookId);
    toast.success(t('wishlist.removed', locale), {
      description: bookTitle,
    });
  };

  const handleClearAll = () => {
    setClearDialogOpen(false);
    books.forEach((book) => toggleWishlist(book.id));
    toast.success(locale === 'id' ? 'Wishlist dikosongkan' : 'Wishlist cleared');
  };

  const handleExploreCatalog = () => {
    setPage('catalog');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
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
                <BreadcrumbPage>{t('nav.wishlist', locale)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] text-white shadow-lg shadow-[#D4AF37]/25">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                  {t('wishlist.title', locale)}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('wishlist.subtitle', locale)}
                </p>
              </div>
            </div>

            {/* Book count + Clear all */}
            {wishlist.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-4 py-2">
                  <BookOpen className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#D4AF37]">
                    {wishlist.length}
                  </span>
                  <span className="text-sm text-[#D4AF37]/80">
                    {t('wishlist.bookCount', locale)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {t('wishlist.clearAll', locale)}
                </Button>
              </div>
            )}
          </div>

          {/* Decorative divider */}
          <div className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: Math.min(wishlist.length, 5) || 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && wishlist.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24"
          >
            {/* Decorative background circles */}
            <div className="relative mb-8">
              <div className="absolute -inset-8 rounded-full bg-[#D4AF37]/5 animate-pulse" />
              <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/10" />
              <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/20 border border-[#D4AF37]/20">
                <Heart className="h-14 w-14 sm:h-16 sm:w-16 text-[#D4AF37]/40" />
              </div>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">
              {t('wishlist.empty', locale)}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
              {t('wishlist.emptyDesc', locale)}
            </p>

            <Button
              onClick={handleExploreCatalog}
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-8 shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300 group"
            >
              <ShoppingBag className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('wishlist.exploreCatalog', locale)}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* Books Grid */}
        {!loading && wishlist.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="relative group"
                >
                  <BookCard book={book} index={index} />

                  {/* Remove from wishlist overlay button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.04 }}
                    className="absolute top-3 right-3 z-20"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(book.id, book.title);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-muted-foreground shadow-md hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110"
                      aria-label={t('wishlist.removeFromWishlist', locale)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Some items not found in DB */}
        {!loading && wishlist.length > 0 && books.length < wishlist.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground/60 text-center mt-6"
          >
            {locale === 'id'
              ? `${wishlist.length - books.length} novel tidak ditemukan dalam katalog`
              : `${wishlist.length - books.length} novel(s) not found in catalog`}
          </motion.p>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t('wishlist.clearAll', locale)}
            </DialogTitle>
            <DialogDescription>
              {t('wishlist.clearConfirm', locale)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
            >
              {t('general.cancel', locale)}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('wishlist.clearAll', locale)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
