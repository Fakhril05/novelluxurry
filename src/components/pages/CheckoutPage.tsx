'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Check,
  MapPin,
  Tag,
  Package,
  ShoppingCart,
  ChevronRight,
  Building,
  QrCode,
  Wallet,
  Clock,
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
import { useAppStore, formatPrice, formatRupiah } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const GOLD = '#D4AF37';
const GOLD_DARK = '#B8960C';
const GOLD_LIGHT = '#F0D060';

const DEFAULT_EXPEDITIONS = [
  { id: 'jne-regular', name: 'JNE Regular', basePrice: 15000, icon: Truck, eta: '3-5 hari', etaEn: '3-5 days' },
  { id: 'jne-express', name: 'JNE Express', basePrice: 25000, icon: Truck, eta: '1-2 hari', etaEn: '1-2 days' },
  { id: 'jne-sameday', name: 'JNE Same Day', basePrice: 50000, icon: Truck, eta: 'Hari ini', etaEn: 'Today' },
];

// Dynamic expedition list — prices updated based on destination city
interface ExpeditionOption {
  id: string;
  name: string;
  price: number;
  icon: typeof Truck;
  eta: string;
  etaEn: string;
}

const PAYMENT_METHODS = [
  { id: 'bank-transfer', name: 'Transfer Bank', nameEn: 'Bank Transfer', icon: Building, desc: 'BCA, BNI, Mandiri, BRI' },
  { id: 'qris', name: 'QRIS', nameEn: 'QRIS', icon: QrCode, desc: 'Scan QR untuk bayar', descEn: 'Scan QR to pay' },
  { id: 'ewallet', name: 'E-Wallet', nameEn: 'E-Wallet', icon: Wallet, desc: 'GoPay, OVO, DANA, ShopeePay' },
  { id: 'virtual-account', name: 'Virtual Account', nameEn: 'Virtual Account', icon: CreditCard, desc: 'Bayar via VA', descEn: 'Pay via VA' },
  { id: 'cod', name: 'COD (Bayar di Tempat)', nameEn: 'COD (Cash on Delivery)', icon: Package, desc: 'Bayar saat barang diterima', descEn: 'Pay when item arrives' },
];

const STEPS = [
  { key: 'address', labelId: 'checkout.stepAddress', icon: MapPin },
  { key: 'shipping', labelId: 'checkout.stepShipping', icon: Truck },
  { key: 'confirm', labelId: 'checkout.stepConfirm', icon: Check },
];

export default function CheckoutPage() {
  const { items, getTotalPrice, getDiscountSavings, clearCart } = useCartStore();
  const { locale, setPage, user, isAuthenticated } = useAppStore();
  const lang = (locale ?? 'id') as Locale;

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

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

  // Dynamic shipping
  const [expeditions, setExpeditions] = useState<ExpeditionOption[]>(
    DEFAULT_EXPEDITIONS.map((e) => ({ ...e, price: e.basePrice }))
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingOrigin] = useState('Bandung');
  const [dynamicCity, setDynamicCity] = useState('');
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addressRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const subtotal = getTotalPrice();
  const savings = getDiscountSavings();
  const shippingCost = expeditions.find((e) => e.id === expedition)?.price ?? 0;
  // Convert everything to full Rupiah for correct addition
  const subtotalRupiah = Math.round(subtotal * 1000);
  const savingsRupiah = Math.round(savings * 1000);
  const voucherDiscountRupiah = Math.round(voucherDiscount * 1000);
  const totalRupiah = Math.max(0, subtotalRupiah - savingsRupiah - voucherDiscountRupiah + shippingCost);
  // Keep legacy `total` in DB-thousands format for API submission
  const total = totalRupiah / 1000;

  // Fetch dynamic shipping rates when city changes
  useEffect(() => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    const city = form.city.trim();
    if (!city || city.length < 2) {
      setExpeditions(DEFAULT_EXPEDITIONS.map((e) => ({ ...e, price: e.basePrice })));
      setDynamicCity('');
      return;
    }
    cityDebounceRef.current = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const res = await fetch('/api/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: city, postalCode: form.postalCode }),
        });
        const data = await res.json();
        if (data.success && data.rates) {
          const updated = DEFAULT_EXPEDITIONS.map((e) => {
            const rate = data.rates.find((r: { service: string; cost: number }) => r.service === e.id);
            return {
              ...e,
              price: rate ? rate.cost : e.basePrice,
            };
          });
          setExpeditions(updated);
          setDynamicCity(city);
          // If selected expedition became unavailable, fallback to regular
          const current = updated.find((e) => e.id === expedition);
          if (current && current.price === 0) {
            setExpedition('jne-regular');
          }
        }
      } catch {
        // On API failure, keep current (default) prices
      } finally {
        setShippingLoading(false);
      }
    }, 500);
    return () => {
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    };
  }, [form.city, form.postalCode]);

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

  const goToStep = (step: number) => {
    if (step === 1 && currentStep === 0) {
      if (!validateForm()) {
        toast.error(lang === 'id' ? 'Lengkapi data pengiriman' : 'Please complete shipping information');
        return;
      }
    }
    setCurrentStep(step);
    const refs = [addressRef, shippingRef, confirmRef];
    setTimeout(() => {
      refs[step]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
      // Convert shipping & total to DB "thousands" format for consistent storage
      const shippingCostDB = Math.round(shippingCost / 1000);
      const totalDB = total; // already in DB-thousands format (totalRupiah / 1000)
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
        shippingCost: shippingCostDB,
        paymentMethod: payment,
        userId: user?.id || null,
        voucherCode: voucherApplied ? voucherCode.toUpperCase() : null,
        voucherDisc: voucherDiscount,
        subtotal,
        discount: savings + voucherDiscount,
        total: totalDB,
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
        setPage('order-success', { orderNumber: data.orderNumber });
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
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <Package className="h-12 w-12 text-[#D4AF37]/50" />
        </motion.div>
        <p className="text-muted-foreground font-medium">{t('cart.empty', lang)}</p>
        <Button
          variant="outline"
          onClick={() => setPage('catalog')}
          className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
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

  const selectedExpedition = expeditions.find((e) => e.id === expedition);

  // Gold focus input class
  const goldInputClass = `h-10 focus-visible:ring-[${GOLD}]/40 focus-visible:border-[${GOLD}]/50 transition-all`;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Subtle gold radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 800px 500px at 20% 10%, rgba(212,175,55,0.03) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 80% 80%, rgba(212,175,55,0.02) 0%, transparent 70%)' }}
      />

      {/* Back Button + Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => setPage('catalog')}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('general.back', lang)}
        </button>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t('checkout.title', lang)}</h1>
      </motion.div>

      {/* ─── Progress Stepper ─── */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-10"
      >
        <div className="relative mx-auto max-w-2xl">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
          {/* Animated gold gradient progress bar fill */}
          <motion.div
            className="absolute top-5 left-0 h-0.5"
            style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
            animate={{
              width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - ${(currentStep / (STEPS.length - 1)) * 40}px)`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          <div className="relative flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (idx <= currentStep) goToStep(idx);
                  }}
                  className="group flex flex-col items-center gap-2"
                  type="button"
                >
                  <motion.div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-11 sm:w-11 ${
                      isCompleted
                        ? ''
                        : isActive
                          ? ''
                          : 'border-muted-foreground/25 bg-background text-muted-foreground/50'
                    }`}
                    style={
                      isCompleted
                        ? { borderColor: GOLD, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#fff', boxShadow: `0 4px 12px -2px ${GOLD}40` }
                        : isActive
                          ? { borderColor: GOLD, backgroundColor: `${GOLD}15`, color: GOLD, boxShadow: `0 0 0 4px ${GOLD}15` }
                          : undefined
                    }
                    whileHover={idx <= currentStep ? { scale: 1.05 } : undefined}
                    whileTap={idx <= currentStep ? { scale: 0.95 } : undefined}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
                    ) : (
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </motion.div>
                  <span
                    className={`text-xs font-medium transition-colors sm:text-sm ${
                      isCompleted || isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                    }`}
                  >
                    {t(step.labelId, lang)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── Two-Column Layout ─── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Forms */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Step 0: Shipping Address */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-address"
                ref={addressRef}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  {/* Gold gradient top border */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    {/* Gold left border section heading */}
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${GOLD}15` }}
                        >
                          <MapPin className="h-4 w-4" style={{ color: GOLD }} />
                        </div>
                        <h2 className="font-heading text-lg font-semibold">{t('checkout.address', lang)}</h2>
                      </div>
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
                          className={`${goldInputClass} ${formErrors.name ? 'border-red-500' : ''}`}
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
                          placeholder="08xxxxxxxxxx"
                          className={`${goldInputClass} ${formErrors.phone ? 'border-red-500' : ''}`}
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
                          className={`${goldInputClass} ${formErrors.address ? 'border-red-500' : ''}`}
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
                          className={`${goldInputClass} ${formErrors.city ? 'border-red-500' : ''}`}
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
                          className={`${goldInputClass} ${formErrors.postalCode ? 'border-red-500' : ''}`}
                        />
                        {formErrors.postalCode && (
                          <p className="text-xs text-red-500">{formErrors.postalCode}</p>
                        )}
                      </div>
                    </div>
                    {/* Gold section divider */}
                    <Separator className="my-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => goToStep(1)}
                        className="h-11 px-6 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
                      >
                        {t('general.next', lang)}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Expedition & Payment */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-shipping"
                ref={shippingRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Back button */}
                <button
                  onClick={() => goToStep(0)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#D4AF37]"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('general.back', lang)}
                </button>

                {/* Expedition */}
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    {/* Gold left border section heading */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${GOLD}15` }}
                          >
                            <Truck className="h-4 w-4" style={{ color: GOLD }} />
                          </div>
                          <h2 className="font-heading text-lg font-semibold">{t('checkout.expedition', lang)}</h2>
                        </div>
                      </div>
                      {dynamicCity && (
                        <span className="text-xs text-muted-foreground">
                          {shippingOrigin} → {dynamicCity}
                        </span>
                      )}
                    </div>
                    <RadioGroup value={expedition} onValueChange={setExpedition} className="grid gap-3">
                      {expeditions.map((exp) => {
                        const isSelected = expedition === exp.id;
                        const unavailable = exp.price === 0 && dynamicCity;
                        if (unavailable) return null;
                        return (
                          <Label
                            key={exp.id}
                            htmlFor={exp.id}
                            className={
                              'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ' +
                              (isSelected
                                ? 'shadow-md'
                                : 'border-border hover:border-[#D4AF37]/40')
                            }
                            style={
                              isSelected
                                ? { borderColor: GOLD, backgroundColor: `${GOLD}08`, boxShadow: `0 4px 16px -4px ${GOLD}20` }
                                : undefined
                            }
                          >
                            <RadioGroupItem value={exp.id} id={exp.id} />
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: isSelected ? `${GOLD}15` : undefined }}
                            >
                              <Truck
                                className="h-5 w-5"
                                style={{ color: isSelected ? GOLD : undefined }}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-sm font-semibold"
                                style={isSelected ? { color: GOLD } : undefined}
                              >
                                {exp.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lang === 'en' ? exp.etaEn : exp.eta}
                              </p>
                            </div>
                            {/* Delivery estimate badge */}
                            <Badge
                              variant="secondary"
                              className="hidden sm:inline-flex text-[10px] font-medium shrink-0"
                              style={{
                                backgroundColor: isSelected ? `${GOLD}15` : undefined,
                                color: isSelected ? GOLD : undefined,
                              }}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {lang === 'en' ? exp.etaEn : exp.eta}
                            </Badge>
                            <p
                              className="text-sm font-bold shrink-0"
                              style={isSelected ? { color: GOLD } : undefined}
                            >
                              {shippingLoading ? (
                                <span className="inline-block h-3.5 w-16 animate-pulse rounded bg-muted" />
                              ) : (
                                formatRupiah(exp.price, lang)
                              )}
                            </p>
                          </Label>
                        );
                      })}
                    </RadioGroup>

                    {/* Gold section divider */}
                    <Separator className="my-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => goToStep(0)}
                        className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                      >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {t('general.back', lang)}
                      </Button>
                      <Button
                        onClick={() => goToStep(2)}
                        className="h-11 px-6 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
                      >
                        {t('general.next', lang)}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    {/* Gold left border section heading */}
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${GOLD}15` }}
                        >
                          <CreditCard className="h-4 w-4" style={{ color: GOLD }} />
                        </div>
                        <h2 className="font-heading text-lg font-semibold">{t('checkout.payment', lang)}</h2>
                      </div>
                    </div>
                    <RadioGroup value={payment} onValueChange={setPayment} className="grid gap-3 sm:grid-cols-2">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = payment === method.id;
                        return (
                          <Label
                            key={method.id}
                            htmlFor={method.id}
                            className={
                              'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ' +
                              (isSelected
                                ? 'shadow-md'
                                : 'border-border hover:border-[#D4AF37]/40')
                            }
                            style={
                              isSelected
                                ? { borderColor: GOLD, backgroundColor: `${GOLD}08`, boxShadow: `0 4px 16px -4px ${GOLD}20` }
                                : undefined
                            }
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: isSelected ? `${GOLD}15` : undefined }}
                            >
                              <Icon
                                className="h-5 w-5"
                                style={{ color: isSelected ? GOLD : undefined }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold"
                                style={isSelected ? { color: GOLD } : undefined}
                              >
                                {lang === 'en' && method.nameEn ? method.nameEn : method.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {lang === 'en' && method.descEn ? method.descEn : method.desc}
                              </p>
                            </div>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Order Confirmation */}
          <AnimatePresence mode="wait">
            {currentStep === 2 && (
              <motion.div
                key="step-confirm"
                ref={confirmRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <button
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#D4AF37]"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('general.back', lang)}
                </button>

                {/* Address Summary */}
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${GOLD}15` }}
                          >
                            <MapPin className="h-4 w-4" style={{ color: GOLD }} />
                          </div>
                          <h2 className="font-heading text-lg font-semibold">{t('checkout.address', lang)}</h2>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToStep(0)}
                        className="text-xs text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                      >
                        {lang === 'id' ? 'Ubah' : 'Change'}
                      </Button>
                    </div>
                    <div className="rounded-lg p-4 border border-[#D4AF37]/10" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.04), transparent)' }}>
                      <p className="font-semibold">{form.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{form.phone}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{form.address}</p>
                      <p className="text-sm text-muted-foreground">{form.city}, {form.postalCode}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Summary */}
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${GOLD}15` }}
                          >
                            <Truck className="h-4 w-4" style={{ color: GOLD }} />
                          </div>
                          <h2 className="font-heading text-lg font-semibold">{t('checkout.expedition', lang)}</h2>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToStep(1)}
                        className="text-xs text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                      >
                        {lang === 'id' ? 'Ubah' : 'Change'}
                      </Button>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-lg p-4 border border-[#D4AF37]/15"
                      style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), transparent)' }}
                    >
                      <div>
                        <p className="font-semibold">{selectedExpedition?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium"
                            style={{ backgroundColor: `${GOLD}15`, color: GOLD }}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {selectedExpedition ? (lang === 'en' ? selectedExpedition.etaEn : selectedExpedition.eta) : ''}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-bold" style={{ color: GOLD }}>
                        {formatRupiah(shippingCost, lang)}
                      </p>
                    </div>

                    <Separator className="my-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />

                    {/* Payment Summary */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${GOLD}15` }}
                      >
                        <CreditCard className="h-4 w-4" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-semibold">{t('checkout.payment', lang)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {PAYMENT_METHODS.find((m) => m.id === payment)?.name}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Itemized Order Summary */}
                <Card className="overflow-hidden" style={{ boxShadow: '0 4px 24px -4px rgba(212,175,55,0.08)' }}>
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="h-8 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${GOLD}15` }}
                        >
                          <ShoppingCart className="h-4 w-4" style={{ color: GOLD }} />
                        </div>
                        <h2 className="font-heading text-lg font-semibold">{t('checkout.items', lang)}</h2>
                      </div>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs"
                        style={{ backgroundColor: `${GOLD}15`, color: GOLD }}
                      >
                        {items.reduce((sum, i) => sum + i.quantity, 0)} {t('checkout.qty', lang)}
                      </Badge>
                    </div>
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                      {items.map((item) => {
                        const price = item.book.discountPrice ?? item.book.price;
                        const lineTotal = price * item.quantity;
                        return (
                          <div
                            key={item.book.id}
                            className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:border-[#D4AF37]/30 transition-colors"
                          >
                            <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                              <img
                                src={item.book.coverImage}
                                alt={item.book.title}
                                className="h-full w-full object-cover"
                              />
                              {item.quantity > 1 && (
                                <div
                                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
                                >
                                  {item.quantity}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-medium leading-tight">
                                {item.book.title}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{item.book.format}</span>
                                <span>×</span>
                                <span>{item.quantity}</span>
                                <span>×</span>
                                <span>{formatPrice(price, lang)}</span>
                              </div>
                            </div>
                            <p className="flex-shrink-0 text-sm font-bold" style={{ color: GOLD }}>
                              {formatPrice(lineTotal, lang)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Place Order Button with shimmer effect */}
                <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="relative h-14 w-full overflow-hidden text-base font-bold text-black transition-all hover:shadow-xl hover:shadow-[#D4AF37]/25"
                    style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)` }}
                  >
                    {/* Shimmer overlay on hover */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
                        backgroundSize: '200% 100%',
                      }}
                      animate={{
                        backgroundPosition: ['-200% 0', '200% 0'],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    {submitting ? (
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        {t('general.loading', lang)}
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        {t('checkout.placeOrder', lang)}
                        <span className="ml-1 text-sm font-normal opacity-80">
                          — {formatRupiah(totalRupiah, lang)}
                        </span>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Order Summary (Sticky) */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="overflow-hidden" style={{ boxShadow: '0 8px 32px -8px rgba(212,175,55,0.12)' }}>
              {/* Gold gradient top border */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})` }} />
              <CardContent className="p-5 sm:p-6">
                <h2 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full" style={{ background: `linear-gradient(180deg, ${GOLD}, ${GOLD_LIGHT})` }} />
                  {t('checkout.orderSummary', lang)}
                </h2>

                {/* Compact Item List with gold dividers */}
                <div className="mb-4 max-h-60 space-y-0 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const price = item.book.discountPrice ?? item.book.price;
                    return (
                      <div
                        key={item.book.id}
                        className="flex gap-3 py-2.5"
                        style={{
                          borderBottom: idx < items.length - 1 ? '1px solid rgba(212,175,55,0.1)' : undefined,
                        }}
                      >
                        <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="h-full w-full object-cover"
                          />
                          {item.quantity > 1 && (
                            <div
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-white"
                              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
                            >
                              {item.quantity}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-medium">{item.book.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.book.format} × {item.quantity}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: GOLD }}>
                            {formatPrice(price * item.quantity, lang)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} className="my-4" />

                {/* Voucher with gold focus ring & gold Apply button */}
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
                        className={`pl-8 h-9 text-sm focus-visible:ring-[${GOLD}]/40 focus-visible:border-[${GOLD}]/50 transition-all ${voucherApplied ? 'border-[#D4AF37]/50' : ''}`}
                        disabled={voucherApplied}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || voucherApplied || !voucherCode.trim()}
                      className="h-9 shrink-0 px-3 transition-all"
                      style={
                        voucherApplied
                          ? { borderColor: GOLD, backgroundColor: `${GOLD}15`, color: GOLD }
                          : { borderColor: GOLD, color: GOLD }
                      }
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
                      className="mt-1.5 text-xs font-medium flex items-center gap-1"
                      style={{ color: GOLD }}
                    >
                      <Tag className="h-3 w-3" />
                      {lang === 'id' ? 'Voucher aktif' : 'Voucher active'}: -{formatPrice(voucherDiscount, lang)}
                    </motion.p>
                  )}
                </div>

                <Separator style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} className="my-4" />

                {/* Price Breakdown */}
                <div className="flex flex-col gap-2.5">
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
                  {voucherApplied && voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: GOLD }}>Voucher</span>
                      <span className="font-medium" style={{ color: GOLD }}>
                        -{formatPrice(voucherDiscount, lang)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('cart.shipping', lang)}</span>
                    <span className="font-medium">{formatRupiah(shippingCost, lang)}</span>
                  </div>

                  <Separator style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />

                  {/* Gold total line */}
                  <div
                    className="flex items-center justify-between rounded-lg p-2 -mx-2"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))' }}
                  >
                    <span className="font-semibold">{t('cart.total', lang)}</span>
                    <span className="text-xl font-bold" style={{ color: GOLD }}>
                      {formatRupiah(totalRupiah, lang)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
