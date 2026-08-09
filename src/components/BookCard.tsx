'use client';

import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Book } from '@/types';
import { toast } from 'sonner';

interface BookCardProps {
  book: Book;
  index?: number;
  className?: string;
}

export default function BookCard({ book, index = 0, className = '' }: BookCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { locale, setPage, wishlist, toggleWishlist } = useAppStore();
  const isWished = wishlist.includes(book.id);
  const hasDiscount = book.discountPrice && book.discountPrice < book.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(book);
    toast.success(locale === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart', { description: book.title });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative ${className}`}
    >
      <button
        onClick={() => setPage('book-detail', { slug: book.slug })}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-xl"
        aria-label={`View details for ${book.title}`}
      >
        <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/5">
          {/* Cover */}
          <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
            <img
              src={book.coverImage}
              alt={book.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {book.isBestSeller && (
                <Badge className="bg-[#D4AF37] text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {t('badge.bestseller', locale)}
                </Badge>
              )}
              {book.isNewArrival && !book.isBestSeller && (
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {t('badge.new', locale)}
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500 text-white border-0 text-[10px] font-bold px-2 py-0.5">
                  -{Math.round((1 - book.discountPrice! / book.price) * 100)}%
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-white shadow-lg hover:bg-[#B8960C] transition-colors"
                aria-label={t('book.addCart', locale)}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleWishlist}
                className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-colors ${isWished ? 'bg-red-500 text-white' : 'bg-white/90 text-foreground hover:bg-red-500 hover:text-white'}`}
                aria-label={t('book.wishlist', locale)}
              >
                <Heart className={`h-3.5 w-3.5 ${isWished ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3.5">
            {/* Category */}
            {book.category && (
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#D4AF37] mb-1">{book.category.name}</p>
            )}
            <h3 className="font-heading text-sm font-semibold leading-tight line-clamp-2 mb-1 group-hover:text-[#D4AF37] transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">{book.author}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(book.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">({book.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">
                {formatPrice(book.discountPrice || book.price, locale)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(book.price, locale)}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
