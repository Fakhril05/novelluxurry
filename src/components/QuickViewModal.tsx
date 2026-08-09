'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingCart, BookOpen, X, Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
  book: Book;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ book, open, onClose }: QuickViewModalProps) {
  const { locale, setPage, wishlist, toggleWishlist, isInWishlist } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const hasDiscount = book.discountPrice !== null && book.discountPrice < book.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - book.discountPrice! / book.price) * 100)
    : 0;
  const isWished = isInWishlist(book.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(book);
    }
    toast.success(
      locale === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart',
      { description: book.title }
    );
    onClose();
  };

  const handleViewDetail = () => {
    setPage('book-detail', { slug: book.slug });
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleWishlist(book.id);
    if (!isWished) {
      toast.success(
        locale === 'id' ? 'Ditambahkan ke wishlist' : 'Added to wishlist',
        { description: book.title }
      );
    }
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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="sm:max-w-3xl p-0 overflow-hidden border-[#D4AF37]/20 glass-card backdrop-blur-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{book.title}</DialogTitle>
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                      className="w-full max-w-[220px] aspect-[2/3] max-h-[400px] object-cover rounded-lg shadow-xl shadow-[#D4AF37]/10"
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
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                    aria-label={t('general.close', locale)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Category Badge */}
                {book.category && (
                  <Badge className="w-fit bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 hover:bg-[#D4AF37]/20">
                    {locale === 'en' && book.category.nameEn ? book.category.nameEn : book.category.name}
                  </Badge>
                )}

                {/* Title */}
                <h2 className="font-heading text-xl font-bold leading-snug text-gradient-gold">
                  {book.title}
                </h2>

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
                        className={`h-4 w-4 ${
                          i < Math.floor(book.rating)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-muted-foreground/25'
                        }`}
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

                {/* Price */}
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl font-bold text-[#D4AF37]">
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

                <Separator className="bg-[#D4AF37]/15" />

                {/* Book Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {/* Format */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span className="text-muted-foreground">{t('book.format', locale)}:</span>
                    <span className="font-medium text-foreground">{formatLabel(book.format)}</span>
                  </div>
                  {/* Pages */}
                  {book.pages && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span className="text-muted-foreground">{t('book.pages', locale)}:</span>
                      <span className="font-medium text-foreground">{book.pages}</span>
                    </div>
                  )}
                  {/* Publisher */}
                  {book.publisher && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4AF37] font-bold">P</span>
                      <span className="text-muted-foreground">{t('book.publisher', locale)}:</span>
                      <span className="font-medium text-foreground truncate">{book.publisher}</span>
                    </div>
                  )}
                  {/* Year */}
                  {book.publishedYear && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4AF37] font-bold">Y</span>
                      <span className="text-muted-foreground">{t('book.year', locale)}:</span>
                      <span className="font-medium text-foreground">{book.publishedYear}</span>
                    </div>
                  )}
                </div>

                {/* Synopsis */}
                {book.synopsis && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {book.synopsis}
                  </p>
                )}

                {/* Quantity Selector + Wishlist */}
                <div className="flex items-center gap-4 mt-1">
                  {/* Quantity */}
                  <div className="flex items-center gap-0 border border-[#D4AF37]/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#D4AF37]/10 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold border-x border-[#D4AF37]/30">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(book.stock || 99, q + 1))}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#D4AF37]/10 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 ${
                      isWished
                        ? 'border-red-500/40 bg-red-500/10 text-red-500'
                        : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                    }`}
                    aria-label={t('book.wishlist', locale)}
                  >
                    <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
                  </button>

                  {/* Stock info */}
                  {book.stock > 0 && book.stock <= 10 && (
                    <span className="text-xs text-amber-500 font-medium">
                      {locale === 'id' ? `Sisa ${book.stock}` : `Only ${book.stock} left`}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-auto pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={book.stock <= 0}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8960C] text-white font-semibold shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('book.addCart', locale)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleViewDetail}
                    className="flex-1 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] font-semibold"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {locale === 'id' ? 'Lihat Detail Lengkap' : 'View Full Details'}
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
