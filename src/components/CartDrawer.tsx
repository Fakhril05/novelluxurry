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
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
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

  const handleCheckout = () => {
    closeCart();
    setPage('checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
  };

  // Estimated delivery date (3-7 business days from now)
  const [estimatedDelivery] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3 + Math.floor(Math.random() * 5));
    return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  });

  // Estimated delivery range for display
  const [deliveryRange] = useState(() => {
    const min = new Date();
    min.setDate(min.getDate() + 3);
    const max = new Date();
    max.setDate(max.getDate() + 7);
    const fmt = (d: Date) => d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      month: 'short', day: 'numeric',
    });
    return `${fmt(min)} - ${fmt(max)}`;
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
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
              <SheetTitle className="font-heading text-lg">
                {t('cart.title', lang)}
              </SheetTitle>
              {itemCount > 0 && (
                <Badge className="border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Items List or Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className="w-28 h-28 rounded-full bg-[#D4AF37]/5 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-[#D4AF37]/40" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#D4AF37]/20">
                <ShoppingBag className="h-3 w-3 text-[#D4AF37] m-auto mt-1.5" />
              </div>
            </motion.div>
            <div className="text-center">
              <p className="font-heading text-lg font-semibold text-foreground">
                {t('cart.empty', lang)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground max-w-[250px]">
                {lang === 'id'
                  ? 'Jelajahi koleksi novel kami dan temukan buku favoritmu'
                  : 'Explore our novel collection and find your favorites'}
              </p>
            </div>
            <Button
              onClick={handleContinueShopping}
              className="mt-2 bg-[#D4AF37] text-black hover:bg-[#C4A030] font-medium shadow-lg shadow-[#D4AF37]/20"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('cart.continue', lang)}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 py-3">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const price = item.book.discountPrice ?? item.book.price;
                  const hasDiscount = item.book.discountPrice != null;
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
                      <div className="flex gap-3 rounded-lg border bg-card p-3">
                        {/* Book Cover */}
                        <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="h-full w-full object-cover"
                          />
                          {hasDiscount && (
                            <Badge className="absolute left-0 top-0 rounded-none rounded-br-md bg-red-500 px-1.5 py-0 text-[10px] text-white">
                              -{Math.round(((item.book.price - item.book.discountPrice!) / item.book.price) * 100)}%
                            </Badge>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <p className="line-clamp-1 text-sm font-semibold leading-tight">
                              {item.book.title}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {item.book.author}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                              {item.book.format}
                            </p>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-sm font-bold text-[#D4AF37]">
                                {formatPrice(price * item.quantity, lang)}
                              </p>
                              {hasDiscount && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                  {formatPrice(item.book.price * item.quantity, lang)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-0 rounded-md border border-[#D4AF37]/20">
                                <button
                                  onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="flex h-7 w-8 items-center justify-center border-x border-[#D4AF37]/20 text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              {/* Remove Button */}
                              <button
                                onClick={() => removeItem(item.book.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
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
                    className="h-9 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 shrink-0 px-3"
                  >
                    {voucherLoading
                      ? t('general.loading', lang)
                      : voucherApplied
                        ? '✓'
                        : t('cart.applyVoucher', lang)}
                  </Button>
                </div>
                {voucherError && (
                  <p className="text-xs text-red-500 -mt-1">{voucherError}</p>
                )}
                {voucherApplied && voucherDiscount > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-600 dark:text-green-400 -mt-1"
                  >
                    {lang === 'id' ? 'Voucher aktif' : 'Voucher active'}: -{formatPrice(voucherDiscount, lang)}
                  </motion.p>
                )}


                <Separator />

                {/* Price Summary */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.subtotal', lang)}</span>
                    <span className="font-medium">{formatPrice(subtotal, lang)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">{t('cart.discount', lang)}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatPrice(savings, lang)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t('cart.total', lang)}</span>
                    <span className="text-lg font-bold text-[#D4AF37]">
                      {formatPrice(finalTotal, lang)}
                    </span>
                  </div>
                </div>

                {/* Estimated Delivery */ }
                <div className="flex items-center gap-2 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/10 px-3 py-2.5">
                  <CalendarClock className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {lang === 'id' ? 'Estimasi tiba' : 'Est. delivery'}
                    </p>
                    <p className="text-xs font-semibold text-[#D4AF37] truncate">
                      {deliveryRange}
                    </p>
                  </div>
                  <Truck className="h-4 w-4 text-[#D4AF37]/50 ml-auto shrink-0" />
                </div>

                <Separator />

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="h-11 w-full bg-[#D4AF37] text-black font-semibold hover:bg-[#C4A030] text-sm"
                >
                  {t('cart.checkout', lang)}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
