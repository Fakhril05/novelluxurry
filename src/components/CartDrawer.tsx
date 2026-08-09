'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  X,
  Minus,
  Plus,
  Trash2,
  BookOpen,
  ShoppingBag,
  Tag,
  Truck,
  CalendarClock,
  Shield,
  Package,
  BookMarked,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const GOLD = '#D4AF37';
const GOLD_DARK = '#B8960C';

function getFormatColor(format: string): { bg: string; text: string } {
  const f = format.toLowerCase();
  if (f.includes('hardcover') || f.includes('hard')) {
    return { bg: `${GOLD}15`, text: GOLD };
  }
  if (f.includes('ebook') || f.includes('digital') || f.includes('e-book')) {
    return { bg: 'rgba(99,102,241,0.1)', text: '#818cf8' };
  }
  if (f.includes('paperback') || f.includes('soft') || f.includes('paper')) {
    return { bg: 'rgba(16,185,129,0.1)', text: '#34d399' };
  }
  return { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' };
}

function getFormatIcon(format: string): typeof BookMarked {
  const f = format.toLowerCase();
  if (f.includes('ebook') || f.includes('digital') || f.includes('e-book')) {
    return BookOpen;
  }
  return BookMarked;
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getDiscountSavings,
  } = useCartStore();
  const { locale, setPage } = useAppStore();
  const lang = (locale ?? 'id') as Locale;

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const itemCount = getTotalItems();
  const subtotal = getTotalPrice();
  const savings = getDiscountSavings();
  const finalTotal = Math.max(0, subtotal - voucherDiscount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim().toUpperCase(), total: subtotal }),
      });
      const data = await res.json();
      if (data.success && data.discount > 0) {
        setVoucherDiscount(data.discount);
        setVoucherApplied(true);
        setVoucherError('');
        toast.success(
          lang === 'id'
            ? `Voucher berhasil! Hemat ${formatPrice(data.discount, lang)}`
            : `Voucher applied! Save ${formatPrice(data.discount, lang)}`
        );
      } else {
        setVoucherDiscount(0);
        setVoucherApplied(false);
        setVoucherError(data.message || (lang === 'id' ? 'Voucher tidak valid' : 'Invalid voucher'));
      }
    } catch {
      setVoucherError(lang === 'id' ? 'Gagal menerapkan voucher' : 'Failed to apply voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherApplied(false);
    setVoucherError('');
    setClearDialogOpen(false);
    toast.success(t('cart.cleared', lang));
  };

  const handleCheckout = () => {
    closeCart();
    setPage('checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
  };

  // Estimated delivery range for display
  const [deliveryRange] = useState(() => {
    const min = new Date();
    min.setDate(min.getDate() + 3);
    const max = new Date();
    max.setDate(max.getDate() + 7);
    const fmt = (d: Date) => d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short', day: 'numeric',
    });
    return `${fmt(min)} – ${fmt(max)}`;
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                <ShoppingBag className="h-4.5 w-4.5 text-[#D4AF37]" />
              </div>
              <SheetTitle className="font-heading text-lg">
                {t('cart.title', lang)}
              </SheetTitle>
              {itemCount > 0 && (
                <Badge className="border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] font-semibold">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Items List or Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
            {/* Empty state illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
              className="relative"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/5 to-[#D4AF37]/10">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/15">
                  <div className="relative">
                    <Package className="h-12 w-12 text-[#D4AF37]/30" />
                    <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] shadow-md shadow-[#D4AF37]/30">
                      <ShoppingBag className="h-2.5 w-2.5 text-black" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-2 left-1/2 h-2 w-2 rounded-full bg-[#D4AF37]/20" />
              <div className="absolute -bottom-1 left-4 h-1.5 w-1.5 rounded-full bg-[#D4AF37]/15" />
              <div className="absolute right-2 bottom-4 h-1.5 w-1.5 rounded-full bg-[#D4AF37]/15" />
            </motion.div>
            <div className="text-center">
              <p className="font-heading text-lg font-semibold text-foreground">
                {t('cart.empty', lang)}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground max-w-[260px]">
                {lang === 'id'
                  ? 'Jelajahi koleksi novel kami dan temukan buku favoritmu'
                  : 'Explore our novel collection and find your favorites'}
              </p>
            </div>
            <Button
              onClick={handleContinueShopping}
              className="mt-1 border-0 bg-[#D4AF37] text-black font-medium shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:bg-[#C4A030] hover:shadow-xl hover:shadow-[#D4AF37]/30"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('cart.continue', lang)}
            </Button>
          </div>
        ) : (
          <>
            {/* Items Header with Clear Cart */}
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">
                {itemCount} {itemCount === 1 ? t('cart.itemCount', lang) : t('cart.itemsCount', lang)}
              </p>
              <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t('cart.clearCart', lang)}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('cart.clearCart', lang)}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('cart.clearCartConfirm', lang)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('general.cancel', lang)}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="border-0 bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('cart.clearCart', lang)}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const unitPrice = item.book.discountPrice ?? item.book.price;
                  const lineSubtotal = unitPrice * item.quantity;
                  const hasDiscount = item.book.discountPrice != null;
                  const formatColors = getFormatColor(item.book.format);
                  const FormatIcon = getFormatIcon(item.book.format);

                  return (
                    <motion.div
                      key={item.book.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mb-3"
                    >
                      <div className="flex gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-border/80">
                        {/* Book Cover */}
                        <div className="relative h-[88px] w-[64px] flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="h-full w-full object-cover"
                          />
                          {hasDiscount && (
                            <Badge className="absolute left-0 top-0 rounded-none rounded-br-lg bg-red-500 px-1.5 py-0 text-[10px] font-bold text-white">
                              -{Math.round(((item.book.price - item.book.discountPrice!) / item.book.price) * 100)}%
                            </Badge>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-semibold leading-tight">
                              {item.book.title}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {item.book.author}
                            </p>
                            {/* Format Badge */}
                            <Badge
                              className="mt-1.5 h-5 gap-1 self-start border-0 px-2 py-0 text-[10px] font-semibold tracking-wide uppercase"
                              style={{ backgroundColor: formatColors.bg, color: formatColors.text }}
                            >
                              <FormatIcon className="h-2.5 w-2.5" />
                              {item.book.format}
                            </Badge>
                          </div>

                          <div className="mt-2 flex items-end justify-between gap-2">
                            {/* Price Info */}
                            <div className="min-w-0">
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-muted-foreground">
                                  {formatPrice(unitPrice, lang)} × {item.quantity}
                                </p>
                              )}
                              <p className="text-sm font-bold" style={{ color: GOLD }}>
                                {formatPrice(lineSubtotal, lang)}
                              </p>
                              {hasDiscount && item.quantity === 1 && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                  {formatPrice(item.book.price, lang)}
                                </p>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-1.5">
                              {/* Quantity Controls */}
                              <div className="flex items-center rounded-lg border border-[#D4AF37]/20">
                                <button
                                  onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="flex h-7 min-w-[28px] items-center justify-center border-x border-[#D4AF37]/20 text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item.book.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                aria-label={t('cart.remove', lang)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </ScrollArea>

            {/* Bottom Section - Sticky */}
            <SheetFooter className="border-t bg-background px-4 py-4">
              <div className="flex w-full flex-col gap-3">
                {/* Voucher Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value);
                        if (voucherApplied) {
                          setVoucherApplied(false);
                          setVoucherDiscount(0);
                          setVoucherError('');
                        }
                      }}
                      placeholder={t('cart.voucher', lang)}
                      className="pl-8 h-9 text-sm"
                      disabled={voucherApplied}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || voucherApplied || !voucherCode.trim()}
                    className="h-9 shrink-0 border-[#D4AF37] px-3 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    {voucherLoading
                      ? t('general.loading', lang)
                      : voucherApplied
                        ? '✓'
                        : t('cart.applyVoucher', lang)}
                  </Button>
                </div>
                {voucherError && (
                  <p className="-mt-1 text-xs text-red-500">{voucherError}</p>
                )}
                {voucherApplied && voucherDiscount > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="-mt-1 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"
                  >
                    <Tag className="h-3 w-3" />
                    {lang === 'id' ? 'Voucher aktif' : 'Voucher active'}: -{formatPrice(voucherDiscount, lang)}
                  </motion.p>
                )}

                <Separator />

                {/* Price Summary */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.subtotal', lang)}</span>
                    <span className="font-medium">{formatPrice(subtotal, lang)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">{t('cart.discount', lang)}</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -{formatPrice(savings, lang)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t('cart.total', lang)}</span>
                    <span className="text-lg font-bold" style={{ color: GOLD }}>
                      {formatPrice(finalTotal, lang)}
                    </span>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-center gap-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 px-3.5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                    <Truck className="h-4.5 w-4.5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      {t('cart.estimatedDelivery', lang)}
                    </p>
                    <p className="text-xs font-bold truncate" style={{ color: GOLD }}>
                      {deliveryRange}
                    </p>
                  </div>
                  <CalendarClock className="h-4 w-4 shrink-0" style={{ color: `${GOLD}50` }} />
                </div>

                <Separator />

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="group relative h-12 w-full border-0 bg-[#D4AF37] font-bold text-black shadow-lg shadow-[#D4AF37]/25 transition-all duration-300 hover:bg-[#C4A030] hover:shadow-xl hover:shadow-[#D4AF37]/35"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                    {t('cart.checkout', lang)}
                  </span>
                  <span className="text-xs font-medium opacity-80">
                    {' '}– {formatPrice(finalTotal, lang)}
                  </span>
                </Button>

                {/* Secure Checkout Text */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" style={{ color: `${GOLD}40` }} />
                  <span>{t('cart.secureCheckout', lang)}</span>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
