'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingCart, BookOpen, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore, formatPrice } from '@/lib/store';
import { useCartStore } from '@/lib/cart-store';
import { t } from '@/lib/i18n';
import type { Book } from '@/types';
import { toast } from 'sonner';

interface QuickViewModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ book, open, onClose }: QuickViewModalProps) {
  const { locale, setPage } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);

  if (!book) return null;

  const hasDiscount = book.discountPrice !== null && book.discountPrice < book.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - book.discountPrice! / book.price) * 100)
    : 0;
  const isLowStock = book.stock > 0 && book.stock <= 10;

  const handleAddToCart = () => {
    addItem(book);
    toast.success(
      locale === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart',
      { description: book.title }
    );
  };

  const handleViewDetail = () => {
    setPage('book-detail', { slug: book.slug });
    onClose();
  };

  const formatLabel = (format: string) => {
    const map: Record<string, string> = {
      hardcover: 'Hardcover',
      paperback: 'Paperback',
      ebook: 'Ebook',
      'hard-cover': 'Hardcover',
      'paper-back': 'Paperback',
    };
    return map[format.toLowerCase()] || format;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={
          'sm:max-w-3xl p-0 overflow-hidden border-border/50 bg-background'
        }
        showCloseButton={false}
      >
        <AnimatePresence mode="wait">
          {open && book && (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col md:flex-row w-full"
            >
              {/* Left: Cover Image */}
              <div className="relative w-full md:w-[260px] lg:w-[280px] flex-shrink-0 bg-secondary/50">
                <div className="overflow-x-auto md:overflow-visible h-full">
                  <div className="min-w-[200px] md:min-w-0 p-4 md:p-6 flex justify-center items-start">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full max-w-[220px] aspect-[2/3] object-cover rounded-lg shadow-xl shadow-black/10"
                    />
                  </div>
                </div>

                {/* Mobile close button */}
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                  aria-label={t('general.close', locale)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Right: Book Info */}
              <div className="flex-1 min-w-0 p-4 md:p-6 flex flex-col gap-3">
                {/* Desktop close button */}
                <div className="hidden md:flex justify-end -mt-1 -mr-1">
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label={t('general.close', locale)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Category Badge */}
                {book.category && (
                  <Badge
                    className={
                      'w-fit bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 hover:bg-[#D4AF37]/20'
                    }
                  >
                    {book.category.name}
                  </Badge>
                )}

                {/* Title */}
                <DialogHeader className="p-0 gap-1.5">
                  <h2 className="font-heading text-lg font-bold leading-snug text-foreground">
                    {book.title}
                  </h2>
                </DialogHeader>

                {/* Author */}
                <p className="text-sm text-muted-foreground">
                  {book.author}
                </p>

                {/* Star Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.floor(book.rating)
                            ? 'fill-[#D4AF37] text-[#D4AF37] h-4 w-4'
                            : 'text-muted-foreground/25 h-4 w-4'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {book.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({book.reviewCount})
                  </span>
                </div>

                <Separator className="bg-border/60" />

                {/* Price */}
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(book.discountPrice ?? book.price, locale)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground/60 line-through">
                      {formatPrice(book.price, locale)}
                    </span>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-red-500/10 text-red-500 border-0 text-[10px] font-bold px-2 py-0.5">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>

                {/* Format Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t('book.format', locale)}:
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-medium border-border text-foreground/80 hover:bg-accent/50"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    {formatLabel(book.format)}
                  </Badge>
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {book.stock > 0 ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span
                            className={
                              isLowStock
                                ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'
                                : 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'
                            }
                          />
                          <span
                            className={
                              isLowStock
                                ? 'relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500'
                                : 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500'
                            }
                          />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isLowStock
                            ? locale === 'id'
                              ? `Sisa ${book.stock}`
                              : `Only ${book.stock} left`
                            : `${book.stock} ${t('book.stock', locale)}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        <span className="text-xs text-red-500 font-medium">
                          {locale === 'id' ? 'Stok habis' : 'Out of stock'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Sold Count */}
                  {book.soldCount > 0 && (
                    <span className="text-xs text-muted-foreground/60">
                      {book.soldCount.toLocaleString()} {t('book.sold', locale)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-auto pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={book.stock <= 0}
                    className={
                      'flex-1 bg-[#D4AF37] hover:bg-[#B8960C] text-white font-semibold shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed'
                    }
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('book.addCart', locale)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewDetail}
                    className={
                      'flex-1 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] font-semibold'
                    }
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {locale === 'id' ? 'Lihat Detail' : 'View Detail'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
