'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Star, Plus, Trash2, X, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Book } from '@/types';

function CompareEmptyState({ locale, onBrowse }: { locale: 'id' | 'en'; onBrowse: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Decorative circles */}
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#F5E6A3]/20 border border-[#D4AF37]/30"
        >
          <Scale className="h-14 w-14 text-[#D4AF37]" />
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

      <h2 className="text-2xl font-bold text-foreground mb-3">
        {t('compare.empty', locale)}
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {t('compare.emptyDesc', locale)}
      </p>
      <Button
        onClick={onBrowse}
        className="bg-[#D4AF37] hover:bg-[#B8960C] text-white rounded-full px-8 py-2.5 shadow-lg shadow-[#D4AF37]/25 transition-all hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-105"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        {t('compare.browseCatalog', locale)}
      </Button>
    </motion.div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? 'fill-[#D4AF37] text-[#D4AF37]'
              : i < rating
              ? 'fill-[#D4AF37]/50 text-[#D4AF37]/50'
              : 'text-muted-foreground/25'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

function BestBadge({ locale }: { locale: 'id' | 'en' }) {
  return (
    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-5 ml-2">
      <Award className="h-3 w-3 mr-1" />
      {t('compare.best', locale)}
    </Badge>
  );
}

export default function ComparePage() {
  const { locale, setPage, comparison, toggleComparison, clearComparison } = useAppStore();
  const [books, setBooks] = useState<Book[]>([]);
  const loading = comparison.length > 0 && books.length === 0;

  useEffect(() => {
    let cancelled = false;
    fetch('/api/books')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const allBooks: Book[] = data.books || data || [];
        const filtered = comparison.length > 0
          ? allBooks.filter((b: Book) => comparison.includes(b.id))
          : [];
        setBooks(filtered);
      })
      .catch(() => {
        if (!cancelled) {
          setBooks([]);
        }
      });
    return () => { cancelled = true; };
  }, [comparison]);

  // Find best values per metric
  const bestValues = useMemo(() => {
    if (books.length < 2) return {};
    const prices = books.map((b) => b.discountPrice || b.price);
    const ratings = books.map((b) => b.rating);
    const pages = books.map((b) => b.pages || 0);
    return {
      lowestPrice: Math.min(...prices),
      highestRating: Math.max(...ratings),
      mostPages: Math.max(...pages),
    };
  }, [books]);

  const handleRemove = (bookId: string) => {
    toggleComparison(bookId);
  };

  if (comparison.length === 0 && !loading) {
    return (
      <div className="min-h-[60vh]">
        <CompareEmptyState
          locale={locale}
          onBrowse={() => setPage('catalog')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Scale className="h-6 w-6 text-[#D4AF37]" />
              <h1 className="text-2xl font-bold text-foreground">{t('compare.title', locale)}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {books.length} {t('compare.bookCount', locale)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPage('catalog')}
              className="border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('compare.addBook', locale)}
            </Button>
            {comparison.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('compare.clearAll', locale)}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('compare.clearAll', locale)}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('compare.clearAllConfirm', locale)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('general.cancel', locale)}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearComparison}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {t('compare.clearAll', locale)}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: comparison.length || 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && books.length > 0 && (
          <>
            {/* Mobile: Stacked Cards */}
            <div className="block lg:hidden space-y-6">
              <AnimatePresence mode="popLayout">
                {books.map((book, index) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="rounded-2xl border border-border overflow-hidden bg-card"
                  >
                    {/* Card Header */}
                    <div className="relative bg-gradient-to-r from-[#D4AF37]/10 to-[#F5E6A3]/5 p-4 flex items-start gap-4">
                      <button
                        onClick={() => handleRemove(book.id)}
                        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors"
                        aria-label={t('compare.remove', locale)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-24 w-16 rounded-lg object-cover shadow-md"
                      />
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground">
                          {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <CompareRowMobile
                        label={t('compare.rating', locale)}
                        value={<StarRating rating={book.rating} />}
                        isBest={book.rating === bestValues.highestRating}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.price', locale)}
                        value={
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {formatPrice(book.discountPrice || book.price, locale)}
                            </span>
                            {book.discountPrice && book.discountPrice < book.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(book.price, locale)}
                              </span>
                            )}
                          </div>
                        }
                        isBest={(book.discountPrice || book.price) === bestValues.lowestPrice}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.format', locale)}
                        value={<span className="text-sm">{book.format}</span>}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.pages', locale)}
                        value={<span className="text-sm">{book.pages || '-'}</span>}
                        isBest={book.pages === bestValues.mostPages}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.publisher', locale)}
                        value={<span className="text-sm">{book.publisher || '-'}</span>}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.language', locale)}
                        value={<span className="text-sm">{book.language}</span>}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.year', locale)}
                        value={<span className="text-sm">{book.publishedYear || '-'}</span>}
                        locale={locale}
                      />
                      <CompareRowMobile
                        label={t('compare.category', locale)}
                        value={<span className="text-sm">{book.category?.name || '-'}</span>}
                        locale={locale}
                      />
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          {t('compare.synopsis', locale)}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {book.synopsis || '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop: Comparison Table */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-border overflow-hidden bg-card"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[180px] text-muted-foreground font-semibold">
                        {/* Attribute label column */}
                      </TableHead>
                      {books.map((book) => (
                        <TableHead key={book.id} className="p-4">
                          <div className="relative group">
                            <button
                              onClick={() => handleRemove(book.id)}
                              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 hover:border-red-200 transition-all z-10"
                              aria-label={t('compare.remove', locale)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="flex flex-col items-center gap-3 min-w-[180px]">
                              <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={book.coverImage}
                                alt={book.title}
                                className="h-48 w-32 rounded-xl object-cover shadow-lg hover:shadow-xl transition-shadow"
                              />
                              <div className="text-center">
                                <h3 className="font-bold text-sm leading-snug line-clamp-2 max-w-[180px] text-foreground">
                                  {book.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                              </div>
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <CompareRow
                      label={t('compare.rating', locale)}
                      books={books}
                      renderValue={(book) => <StarRating rating={book.rating} />}
                      isBest={(book) => book.rating === bestValues.highestRating}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.price', locale)}
                      books={books}
                      renderValue={(book) => (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-foreground">
                            {formatPrice(book.discountPrice || book.price, locale)}
                          </span>
                          {book.discountPrice && book.discountPrice < book.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(book.price, locale)}
                            </span>
                          )}
                        </div>
                      )}
                      isBest={(book) => (book.discountPrice || book.price) === bestValues.lowestPrice}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.format', locale)}
                      books={books}
                      renderValue={(book) => <span className="text-sm">{book.format}</span>}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.pages', locale)}
                      books={books}
                      renderValue={(book) => <span className="text-sm font-medium">{book.pages || '-'}</span>}
                      isBest={(book) => book.pages === bestValues.mostPages}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.publisher', locale)}
                      books={books}
                      renderValue={(book) => <span className="text-sm">{book.publisher || '-'}</span>}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.language', locale)}
                      books={books}
                      renderValue={(book) => <span className="text-sm">{book.language}</span>}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.year', locale)}
                      books={books}
                      renderValue={(book) => <span className="text-sm">{book.publishedYear || '-'}</span>}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.category', locale)}
                      books={books}
                      renderValue={(book) => <Badge variant="secondary" className="text-xs">{book.category?.name || '-'}</Badge>}
                      locale={locale}
                    />
                    <CompareRow
                      label={t('compare.synopsis', locale)}
                      books={books}
                      renderValue={(book) => (
                        <p className="text-sm text-muted-foreground text-left line-clamp-2 max-w-[220px]">
                          {book.synopsis || '-'}
                        </p>
                      )}
                      locale={locale}
                      last
                    />
                  </TableBody>
                </Table>
              </motion.div>
            </div>

            {/* Empty slot indicator */}
            {books.length < 3 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  variant="outline"
                  onClick={() => setPage('catalog')}
                  className="border-dashed border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-solid rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {locale === 'id'
                    ? `Tambah ${3 - books.length} buku lagi`
                    : `Add ${3 - books.length} more book${3 - books.length > 1 ? 's' : ''}`}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  books,
  renderValue,
  isBest,
  locale,
  last = false,
}: {
  label: string;
  books: Book[];
  renderValue: (book: Book) => React.ReactNode;
  isBest?: (book: Book) => boolean;
  locale: 'id' | 'en';
  last?: boolean;
}) {
  return (
    <TableRow className={`${!last ? 'border-b border-border' : ''}`}>
      <TableCell className="font-semibold text-sm text-muted-foreground whitespace-nowrap py-3 px-4 bg-muted/20">
        {label}
      </TableCell>
      {books.map((book, idx) => (
        <TableCell
          key={book.id}
          className={`text-center py-3 px-4 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}
        >
          <div className="flex items-center justify-center gap-1">
            {renderValue(book)}
            {isBest && isBest(book) && <BestBadge locale={locale} />}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

function CompareRowMobile({
  label,
  value,
  isBest,
  locale,
}: {
  label: string;
  value: React.ReactNode;
  isBest?: boolean;
  locale: 'id' | 'en';
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1 justify-end">
        {value}
        {isBest && <BestBadge locale={locale} />}
      </div>
    </div>
  );
}
