'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import QuickViewModal from '@/components/QuickViewModal';
import type { Book } from '@/types';
import { toast } from 'sonner';

/* Track recently viewed */
function trackRecentlyViewed(bookId: string) {
  if (typeof window === 'undefined') return;
  try {
    let ids: string[] = JSON.parse(localStorage.getItem('noveluxe-recently-viewed') || '[]');
    ids = ids.filter((id) => id !== bookId);
    ids.unshift(bookId);
    ids = ids.slice(0, 8);
    localStorage.setItem('noveluxe-recently-viewed', JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
  } catch { /* ignore */ }
}

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
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(book);
    toast.success(locale === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart', { description: book.title });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book.id);
    if (!isWished) toast.success(locale === 'id' ? 'Ditambahkan ke wishlist' : 'Added to wishlist', { description: book.title });
  };

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    trackRecentlyViewed(book.id);
    setQuickViewOpen(true);
  }, [book.id]);

  const handleCardClick = () => {
    trackRecentlyViewed(book.id);
    setPage('book-detail', { slug: book.slug });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className={`group relative ${className}`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
          className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-2xl cursor-pointer"
          aria-label={`View details for ${book.title}`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-[#D4AF37]/40 hover:-translate-y-1 book-card-glow">
            {/* Shine effect on hover */}
            <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(212,175,55,0.08) 45%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0.08) 55%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out',
              }}
            />

            {/* Cover */}
            <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
              <img
                src={book.coverImage}
                alt={book.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Quick view button - desktop hover */}
              <div
                className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
                onMouseLeave={() => { hoverTimeout.current = setTimeout(() => setQuickViewOpen(false), 300); }}
              >
                <button
                  onClick={handleQuickView}
                  className="flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-2 border border-white/20 hover:bg-[#D4AF37]/30 hover:border-[#D4AF37]/40 transition-all"
                >
                  <Eye className="h-4 w-4 text-white" />
                  <span className="text-xs font-medium text-white">{locale === 'id' ? 'Quick View' : 'Quick View'}</span>
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {book.isBestSeller && (
                  <Badge className="bg-[#D4AF37] text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('badge.bestseller', locale)}
                  </Badge>
                )}
                {book.isNewArrival && !book.isBestSeller && (
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                    {t('badge.new', locale)}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white border-0 text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
                    -{Math.round((1 - book.discountPrice! / book.price) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                <button
                  onClick={handleAddToCart}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/30 hover:bg-[#B8960C] hover:scale-110 transition-all"
                  aria-label={t('book.addCart', locale)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={handleWishlist}
                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg hover:scale-110 transition-all ${isWished ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-white/90 text-foreground hover:bg-red-500 hover:text-white'}`}
                  aria-label={t('book.wishlist', locale)}
                >
                  <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              {book.category && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D4AF37] mb-1.5">{book.category.name}</p>
              )}
              <h3 className="font-heading text-[15px] font-bold leading-snug line-clamp-2 mb-1 group-hover:text-[#D4AF37] transition-colors duration-300">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2.5">{book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(book.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-muted-foreground/25'}`} />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{book.rating}</span>
                <span className="text-[11px] text-muted-foreground/60">({book.reviewCount})</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(book.discountPrice || book.price, locale)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground/70 line-through">
                    {formatPrice(book.price, locale)}
                  </span>
                )}
              </div>
              {book.soldCount > 0 && (
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">{book.soldCount.toLocaleString()} {t('book.sold', locale)}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        book={book}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
