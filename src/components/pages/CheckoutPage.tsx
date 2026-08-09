'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  QrCode,
  Wallet,
  Building,
  Check,
  MapPin,
  Tag,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const EXPEDITIONS = [
  { id: 'jne-regular', name: 'JNE Regular', price: 15000, icon: Truck, eta: '3-5 hari' },
  { id: 'jne-express', name: 'JNE Express', price: 25000, icon: Truck, eta: '1-2 hari' },
  { id: 'jne-sameday', name: 'JNE Same Day', price: 50000, icon: Truck, eta: 'Hari ini' },
];

const PAYMENT_METHODS = [
  { id: 'bank-transfer', name: 'Transfer Bank', icon: Building, desc: 'BCA, BNI, Mandiri, BRI' },
  { id: 'qris', name: 'QRIS', icon: QrCode, desc: 'Scan QR untuk bayar' },
  { id: 'ewallet', name: 'E-Wallet', icon: Wallet, desc: 'GoPay, OVO, DANA, ShopeePay' },
  { id: 'virtual-account', name: 'Virtual Account', icon: CreditCard, desc: 'Bayar via VA' },
  { id: 'cod', name: 'COD (Bayar di Tempat)', icon: Package, desc: 'Bayar saat barang diterima' },
];

const STEPS = [
  { key: 'address', labelId: 'checkout.address', icon: MapPin },
  { key: 'expedition', labelId: 'checkout.expedition', icon: Truck },
  { key: 'payment', labelId: 'checkout.payment', icon: CreditCard },
  { key: 'confirm', labelId: 'checkout.placeOrder', icon: Check },
];

export default function CheckoutPage() {
  const { items, getTotalPrice, getDiscountSavings, clearCart } = useCartStore();
  const { locale, setPage, user, isAuthenticated } = useAppStore();
  const lang = (locale ?? 'id') as Locale;

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [expedition, setExpedition] = useState('jne-regular');
  const [payment, setPayment] = useState('bank-transfer');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const savings = getDiscountSavings();
  const shippingCost = EXPEDITIONS.find((e) => e.id === expedition)?.price ?? 0;
  const total = Math.max(0, subtotal - voucherDiscount + shippingCost);

  // Pre-fill from user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      }));
    }
  }, [isAuthenticated, user]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = lang === 'id' ? 'Nama wajib diisi' : 'Name is required';
    if (!form.phone.trim()) errors.phone = lang === 'id' ? 'Nomor telepon wajib diisi' : 'Phone is required';
    if (!form.address.trim()) errors.address = lang === 'id' ? 'Alamat wajib diisi' : 'Address is required';
    if (!form.city.trim()) errors.city = lang === 'id' ? 'Kota wajib diisi' : 'City is required';
    if (!form.postalCode.trim()) errors.postalCode = lang === 'id' ? 'Kode pos wajib diisi' : 'Postal code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error(lang === 'id' ? 'Keranjang kosong' : 'Cart is empty');
      return;
    }
    if (!validateForm()) {
      toast.error(lang === 'id' ? 'Lengkapi data pengiriman' : 'Please complete shipping information');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          bookId: item.book.id,
          title: item.book.title,
          quantity: item.quantity,
          price: item.book.discountPrice ?? item.book.price,
          format: item.book.format,
        })),
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingAddr: form.address,
        shippingCity: form.city,
        shippingCode: form.postalCode,
        expedition,
        shippingCost,
        paymentMethod: payment,
        userId: user?.id || null,
        voucherCode: voucherApplied ? voucherCode.toUpperCase() : null,
        voucherDisc: voucherDiscount,
        subtotal,
        discount: savings + voucherDiscount,
        total,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          lang === 'id' ? 'Pesanan berhasil dibuat!' : 'Order placed successfully!',
          { description: data.orderNumber || '' }
        );
        clearCart();
        setPage('dashboard', { tab: 'orders' });
      } else {
        toast.error(data.message || (lang === 'id' ? 'Gagal membuat pesanan' : 'Failed to place order'));
      }
    } catch {
      toast.error(lang === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-muted"
        >
          <Package className="h-12 w-12 text-muted-foreground/50" />
        </motion.div>
        <p className="text-muted-foreground font-medium">{t('cart.empty', lang)}</p>
        <Button
          variant="outline"
          onClick={() => setPage('catalog')}
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          {t('cart.continue', lang)}
        </Button>
      </div>
    );
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Button + Title */
      }
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => setPage('catalog')}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('general.back', lang)}
        </button>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t('checkout.title', lang)}</h1>
      </motion.div>

      {/* Step Indicator */
      }
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-0 sm:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === 0;
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors sm:h-9 sm:w-9 ${
                      isActive
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'border-muted-foreground/30 text-muted-foreground/50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span
                    className={`hidden text-[10px] sm:block sm:text-xs ${
                      isActive ? 'font-medium text-[#D4AF37]' : 'text-muted-foreground/50'
                    }`}
                  >
                    {t(step.labelId, lang)}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="mx-2 h-px w-8 bg-muted-foreground/20 sm:mx-4 sm:w-12 lg:w-16" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Two-Column Layout */
      }
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Forms */
        }
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Shipping Address */
          }
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <h2 className="font-heading text-lg font-semibold">{t('checkout.address', lang)}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      {t('checkout.name', lang)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder={lang === 'id' ? 'Masukkan nama lengkap' : 'Enter full name'}
                      className={`h-10 ${formErrors.name ? 'border-red-500' : ''}`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {t('checkout.phone', lang)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder={lang === 'id' ? '08xxxxxxxxxx' : '08xxxxxxxxxx'}
                      className={`h-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      {t('checkout.addressField', lang)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder={lang === 'id' ? 'Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan' : 'Street, Ward, District'}
                      className={`h-10 ${formErrors.address ? 'border-red-500' : ''}`}
                    />
                    {formErrors.address && (
                      <p className="text-xs text-red-500">{formErrors.address}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">
                      {t('checkout.city', lang)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder={lang === 'id' ? 'Jakarta Selatan' : 'South Jakarta'}
                      className={`h-10 ${formErrors.city ? 'border-red-500' : ''}`}
                    />
                    {formErrors.city && (
                      <p className="text-xs text-red-500">{formErrors.city}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="postal" className="text-sm font-medium">
                      {t('checkout.postal', lang)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postal"
                      value={form.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder="12345"
                      className={`h-10 ${formErrors.postalCode ? 'border-red-500' : ''}`}
                    />
                    {formErrors.postalCode && (
                      <p className="text-xs text-red-500">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expedition */
          }
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <Truck className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <h2 className="font-heading text-lg font-semibold">{t('checkout.expedition', lang)}</h2>
                </div>
                <RadioGroup value={expedition} onValueChange={setExpedition} className="grid gap-3">
                  {EXPEDITIONS.map((exp) => {
                    const isSelected = expedition === exp.id;
                    return (
                      <Label
                        key={exp.id}
                        htmlFor={exp.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm'
                            : 'border-border hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <RadioGroupItem value={exp.id} id={exp.id} />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Truck className={`h-5 w-5 ${isSelected ? 'text-[#D4AF37]' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${isSelected ? 'text-[#D4AF37]' : ''}`}>
                            {exp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{exp.eta}</p>
                        </div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-[#D4AF37]' : ''}`}>
                          {formatPrice(exp.price, lang)}
                        </p>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Method */
          }
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <h2 className="font-heading text-lg font-semibold">{t('checkout.payment', lang)}</h2>
                </div>
                <RadioGroup value={payment} onValueChange={setPayment} className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isSelected = payment === method.id;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm'
                            : 'border-border hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isSelected ? 'bg-[#D4AF37]/10' : 'bg-muted'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? 'text-[#D4AF37]' : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold ${isSelected ? 'text-[#D4AF37]' : ''}`}
                          >
                            {method.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Order Summary (Sticky) */
        }
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <h2 className="mb-4 font-heading text-lg font-semibold">
                  {t('checkout.orderSummary', lang)}
                </h2>

                {/* Compact Item List */
                }
                <div className="mb-4 flex max-h-60 flex-col gap-3 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const price = item.book.discountPrice ?? item.book.price;
                    return (
                      <div key={item.book.id} className="flex gap-3">
                        <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium">{item.book.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.book.format} × {item.quantity}
                          </p>
                          <p className="text-xs font-semibold text-[#D4AF37]">
                            {formatPrice(price * item.quantity, lang)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Voucher */
                }
                <div className="mb-4">
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
                    <p className="mt-1 text-xs text-red-500">{voucherError}</p>
                  )}
                  {voucherApplied && voucherDiscount > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-green-600 dark:text-green-400"
                    >
                      {lang === 'id' ? 'Voucher aktif' : 'Voucher active'}: -{formatPrice(voucherDiscount, lang)}
                    </motion.p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */
                }
                <div className="flex flex-col gap-2.5">
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
                  {voucherApplied && voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Voucher</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        -{formatPrice(voucherDiscount, lang)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.shipping', lang)}</span>
                    <span className="font-medium">{formatPrice(shippingCost, lang)}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t('cart.total', lang)}</span>
                    <span className="text-xl font-bold text-[#D4AF37]">{formatPrice(total, lang)}</span>
                  </div>
                </div>

                {/* Place Order Button */
                }
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-5 h-12 w-full bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#C4A030] disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      {t('general.loading', lang)}
                    </span>
                  ) : (
                    t('checkout.placeOrder', lang)
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
