/*
 * i18n keys to extract (add to lib/i18n.ts):
 *
 * ID:
 *   'tracking.title': 'Lacak Pesanan',
 *   'tracking.searchPlaceholder': 'Masukkan nomor pesanan (cth: NVX-XXXX)',
 *   'tracking.searchButton': 'Lacak',
 *   'tracking.noOrder': 'Pesanan tidak ditemukan',
 *   'tracking.noOrderDesc': 'Periksa kembali nomor pesanan yang kamu masukkan.',
 *   'tracking.orderSummary': 'Ringkasan Pesanan',
 *   'tracking.orderNumber': 'Nomor Pesanan',
 *   'tracking.orderDate': 'Tanggal Pesanan',
 *   'tracking.orderStatus': 'Status',
 *   'tracking.progress': 'Proses Pesanan',
 *   'tracking.stepPlaced': 'Pesanan Dibuat',
 *   'tracking.stepPlacedDesc': 'Pesanan kamu berhasil dibuat dan menunggu pembayaran.',
 *   'tracking.stepConfirmed': 'Pembayaran Dikonfirmasi',
 *   'tracking.stepConfirmedDesc': 'Pembayaran telah dikonfirmasi. Pesanan sedang disiapkan.',
 *   'tracking.stepProcessing': 'Sedang Diproses',
 *   'tracking.stepProcessingDesc': 'Pesananmu sedang dikemas dan dipersiapkan untuk pengiriman.',
 *   'tracking.stepShipped': 'Dikirim',
 *   'tracking.stepShippedDesc': 'Pesanan telah dikirim dan sedang dalam perjalanan ke alamatmu.',
 *   'tracking.stepDelivered': 'Diterima',
 *   'tracking.stepDeliveredDesc': 'Pesanan telah berhasil diterima. Terima kasih telah berbelanja!',
 *   'tracking.stepCancelled': 'Dibatalkan',
 *   'tracking.stepCancelledDesc': 'Pesanan ini telah dibatalkan.',
 *   'tracking.items': 'Item Pesanan',
 *   'tracking.shippingAddress': 'Alamat Pengiriman',
 *   'tracking.paymentMethod': 'Metode Pembayaran',
 *   'tracking.backToOrders': 'Kembali ke Pesanan',
 *   'tracking.searchTitle': 'Lacak Pesanan Kamu',
 *   'tracking.searchSubtitle': 'Masukkan nomor pesanan untuk melihat status pengiriman.',
 *   'tracking.searching': 'Mencari pesanan...',
 *   'tracking.subtotal': 'Subtotal',
 *   'tracking.shipping': 'Ongkos Kirim',
 *   'tracking.discount': 'Diskon',
 *   'tracking.total': 'Total',
 *   'tracking.quantity': 'Jumlah',
 *   'tracking.notFoundTitle': 'Pesanan Tidak Ditemukan',
 *   'tracking.notFoundDesc': 'Pesanan dengan ID tersebut tidak ditemukan. Mungkin sudah dihapus atau ID salah.',
 *   'tracking.tryAgain': 'Coba Lagi',
 *   'tracking.receiver': 'Penerima',
 *   'tracking.phone': 'Telepon',
 *   'tracking.address': 'Alamat',
 *   'tracking.city': 'Kota',
 *   'tracking.expedition': 'Ekspedisi',
 *
 * EN:
 *   'tracking.title': 'Track Order',
 *   'tracking.searchPlaceholder': 'Enter order number (e.g. NVX-XXXX)',
 *   'tracking.searchButton': 'Track',
 *   'tracking.noOrder': 'Order Not Found',
 *   'tracking.noOrderDesc': 'Please double-check the order number you entered.',
 *   'tracking.orderSummary': 'Order Summary',
 *   'tracking.orderNumber': 'Order Number',
 *   'tracking.orderDate': 'Order Date',
 *   'tracking.orderStatus': 'Status',
 *   'tracking.progress': 'Order Progress',
 *   'tracking.stepPlaced': 'Order Placed',
 *   'tracking.stepPlacedDesc': 'Your order has been placed and is awaiting payment.',
 *   'tracking.stepConfirmed': 'Payment Confirmed',
 *   'tracking.stepConfirmedDesc': 'Payment has been confirmed. Your order is being prepared.',
 *   'tracking.stepProcessing': 'Processing',
 *   'tracking.stepProcessingDesc': 'Your order is being packed and prepared for shipment.',
 *   'tracking.stepShipped': 'Shipped',
 *   'tracking.stepShippedDesc': 'Your order has been shipped and is on its way to you.',
 *   'tracking.stepDelivered': 'Delivered',
 *   'tracking.stepDeliveredDesc': 'Your order has been delivered. Thank you for shopping!',
 *   'tracking.stepCancelled': 'Cancelled',
 *   'tracking.stepCancelledDesc': 'This order has been cancelled.',
 *   'tracking.items': 'Order Items',
 *   'tracking.shippingAddress': 'Shipping Address',
 *   'tracking.paymentMethod': 'Payment Method',
 *   'tracking.backToOrders': 'Back to Orders',
 *   'tracking.searchTitle': 'Track Your Order',
 *   'tracking.searchSubtitle': 'Enter your order number to view shipping status.',
 *   'tracking.searching': 'Searching for order...',
 *   'tracking.subtotal': 'Subtotal',
 *   'tracking.shipping': 'Shipping',
 *   'tracking.discount': 'Discount',
 *   'tracking.total': 'Total',
 *   'tracking.quantity': 'Qty',
 *   'tracking.notFoundTitle': 'Order Not Found',
 *   'tracking.notFoundDesc': 'The order with this ID could not be found. It may have been removed or the ID is incorrect.',
 *   'tracking.tryAgain': 'Try Again',
 *   'tracking.receiver': 'Receiver',
 *   'tracking.phone': 'Phone',
 *   'tracking.address': 'Address',
 *   'tracking.city': 'City',
 *   'tracking.expedition': 'Expedition',
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { LucideIcon } from 'lucide-react';

// --- Types ---
interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  format: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddr: string | null;
  shippingCity: string | null;
  shippingCode: string | null;
  expedition: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// --- Status Badge Config ---
const STATUS_CONFIG: Record<
  string,
  { labelKey: string; color: string }
> = {
  pending: {
    labelKey: 'dashboard.pending',
    color:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
  },
  processing: {
    labelKey: 'dashboard.processing',
    color:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
  },
  shipped: {
    labelKey: 'dashboard.shipped',
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300',
  },
  delivered: {
    labelKey: 'dashboard.delivered',
    color:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300',
  },
  cancelled: {
    labelKey: 'dashboard.cancelled',
    color:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300',
  },
};

// --- Timeline Step Config ---
interface TimelineStep {
  key: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  isCompleted: (status: string) => boolean;
  isActive: (status: string) => boolean;
  isHidden: (status: string) => boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: 'placed',
    titleKey: 'tracking.stepPlaced',
    descKey: 'tracking.stepPlacedDesc',
    icon: ShoppingBag,
    isCompleted: () => true,
    isActive: (status) => status === 'pending',
    isHidden: () => false,
  },
  {
    key: 'confirmed',
    titleKey: 'tracking.stepConfirmed',
    descKey: 'tracking.stepConfirmedDesc',
    icon: CreditCard,
    isCompleted: (status) => status !== 'pending' && status !== 'cancelled',
    isActive: (status) => status === 'processing',
    isHidden: (status) => status === 'cancelled',
  },
  {
    key: 'processing',
    titleKey: 'tracking.stepProcessing',
    descKey: 'tracking.stepProcessingDesc',
    icon: Package,
    isCompleted: (status) => ['processing', 'shipped', 'delivered'].includes(status),
    isActive: (status) => status === 'processing',
    isHidden: (status) => status === 'cancelled',
  },
  {
    key: 'shipped',
    titleKey: 'tracking.stepShipped',
    descKey: 'tracking.stepShippedDesc',
    icon: Truck,
    isCompleted: (status) => ['shipped', 'delivered'].includes(status),
    isActive: (status) => status === 'shipped',
    isHidden: (status) => status === 'cancelled',
  },
  {
    key: 'delivered',
    titleKey: 'tracking.stepDelivered',
    descKey: 'tracking.stepDeliveredDesc',
    icon: CheckCircle,
    isCompleted: (status) => status === 'delivered',
    isActive: (status) => status === 'delivered',
    isHidden: (status) => status === 'cancelled',
  },
  {
    key: 'cancelled',
    titleKey: 'tracking.stepCancelled',
    descKey: 'tracking.stepCancelledDesc',
    icon: XCircle,
    isCompleted: (status) => status === 'cancelled',
    isActive: (status) => status === 'cancelled',
    isHidden: (status) => status !== 'cancelled',
  },
];

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// --- Helpers ---
function formatDate(dateStr: string, locale: 'id' | 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string, locale: 'id' | 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentLabel(method: string | null, locale: 'id' | 'en'): string {
  if (!method) return '-';
  const labels: Record<string, { id: string; en: string }> = {
    'bank-transfer': { id: 'Transfer Bank', en: 'Bank Transfer' },
    qris: { id: 'QRIS', en: 'QRIS' },
    'e-wallet': { id: 'E-Wallet', en: 'E-Wallet' },
    'virtual-account': { id: 'Virtual Account', en: 'Virtual Account' },
    cod: { id: 'COD (Bayar di Tempat)', en: 'COD (Cash on Delivery)' },
  };
  return labels[method]?.[locale] || method;
}

function getEstimatedDate(orderDate: string, daysOffset: number, locale: 'id' | 'en'): string {
  const d = new Date(orderDate);
  d.setDate(d.getDate() + daysOffset);
  return d.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// --- Component ---
export default function OrderTrackingPage() {
  const { pageParams, locale, setPage } = useAppStore();
  const orderId = pageParams.orderId || null;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- Search state (when no orderId) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const fetchOrder = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/orders?orderId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.error) {
            setError(true);
            setOrder(null);
          } else {
            setOrder(data);
          }
        } else {
          setError(true);
          setOrder(null);
        }
      } catch {
        setError(true);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId, fetchOrder]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setSearching(true);
    setSearchError(false);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.error || !data.id) {
          setSearchError(true);
          setOrder(null);
        } else {
          setSearchError(false);
          setOrder(data);
        }
      } else {
        setSearchError(true);
        setOrder(null);
      }
    } catch {
      setSearchError(true);
      setOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const handleBack = () => {
    setPage('dashboard', { tab: 'orders' });
  };

  const statusCfg = order ? STATUS_CONFIG[order.status] || STATUS_CONFIG.pending : null;

  // ==================== RENDER ====================

  // --- Loading Skeleton ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Breadcrumb skeleton */}
            <motion.div variants={fadeInUp} className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </motion.div>

            {/* Back button skeleton */}
            <motion.div variants={fadeInUp}>
              <Skeleton className="h-9 w-40" />
            </motion.div>

            {/* Order summary skeleton */}
            <motion.div variants={fadeInUp}>
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline skeleton */}
            <motion.div variants={fadeInUp}>
              <Skeleton className="h-6 w-40 mb-4" />
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Items skeleton */}
            <motion.div variants={fadeInUp}>
              <Skeleton className="h-6 w-32 mb-4" />
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping & Payment skeleton */}
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div variants={fadeInUp}>
                <Skeleton className="h-6 w-36 mb-4" />
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Skeleton className="h-6 w-36 mb-4" />
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Search Form (no orderId in params) ---
  if (!orderId && !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Breadcrumb */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage('home');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('nav.home', locale)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      {t('tracking.title', locale)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

            {/* Search Card */}
            <motion.div variants={fadeInUp}>
              <Card className="border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                  >
                    <Search className="h-8 w-8 text-[#D4AF37]" />
                  </motion.div>
                  <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                    {t('tracking.searchTitle', locale)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t('tracking.searchSubtitle', locale)}
                  </p>
                </div>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('tracking.searchPlaceholder', locale)}
                      className="flex-1 h-11"
                    />
                    <Button
                      type="submit"
                      disabled={searching || !searchQuery.trim()}
                      className="h-11 bg-[#D4AF37] text-white hover:bg-[#B8960C] px-8 shrink-0"
                    >
                      {searching ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Search className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {t('tracking.searchButton', locale)}
                    </Button>
                  </form>

                  {searchError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-3"
                    >
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {t('tracking.noOrder', locale)}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Error State (order not found) ---
  if (error || (!order && orderId)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Breadcrumb */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage('home');
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('nav.home', locale)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage('dashboard', { tab: 'orders' });
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('nav.orders', locale)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      {t('tracking.notFoundTitle', locale)}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-border/50">
                <CardContent className="py-16 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </motion.div>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {t('tracking.notFoundTitle', locale)}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    {t('tracking.notFoundDesc', locale)}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="border-border"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t('tracking.backToOrders', locale)}
                    </Button>
                    <Button
                      onClick={() => fetchOrder(orderId)}
                      className="bg-[#D4AF37] text-white hover:bg-[#B8960C]"
                    >
                      {t('tracking.tryAgain', locale)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Main Order Tracking View ---
  if (!order) return null;

  const visibleSteps = TIMELINE_STEPS.filter(
    (step) => !step.isHidden(order.status)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Breadcrumb */}
          <motion.div variants={fadeInUp}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage('home');
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('nav.home', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage('dashboard', { tab: 'orders' });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('nav.orders', locale)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium font-mono text-sm">
                    {order.orderNumber}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>

          {/* Back Button */}
          <motion.div variants={fadeInUp}>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="-ml-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('tracking.backToOrders', locale)}
            </Button>
          </motion.div>

          {/* ========== 1. Order Summary Card ========== */}
          <motion.div variants={fadeInUp}>
            <Card className="border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent p-5">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {t('tracking.orderSummary', locale)}
                </h2>
              </div>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t('tracking.orderNumber', locale)}
                      </span>
                    </div>
                    <p className="font-mono text-lg font-bold text-foreground">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('tracking.orderDate', locale)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>
                </div>

                <Separator className="mb-4" />

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Status */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {t('tracking.orderStatus', locale)}
                    </p>
                    {statusCfg && (
                      <Badge
                        variant="outline"
                        className={`${statusCfg.color} text-xs font-semibold border`}
                      >
                        {t(statusCfg.labelKey, locale)}
                      </Badge>
                    )}
                  </div>

                  {/* Items Count */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {t('tracking.items', locale)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {order.items.length}{' '}
                      {locale === 'id'
                        ? order.items.length > 1
                          ? 'item'
                          : 'item'
                        : order.items.length > 1
                          ? 'items'
                          : 'item'}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {t('tracking.total', locale)}
                    </p>
                    <p className="text-base font-bold text-[#D4AF37]">
                      {formatPrice(order.total, locale)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ========== 2. Timeline / Stepper ========== */}
          <motion.div variants={fadeInUp}>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
              {t('tracking.progress', locale)}
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-5 sm:p-6">
                <div className="relative">
                  {visibleSteps.map((step, idx) => {
                    const Icon = step.icon;
                    const completed = step.isCompleted(order.status);
                    const active = step.isActive(order.status);
                    const isLast = idx === visibleSteps.length - 1;

                    return (
                      <div key={step.key} className="relative flex gap-4">
                        {/* Vertical Line */}
                        {!isLast && (
                          <div
                            className="absolute left-5 top-12 w-0.5 h-[calc(100%-2rem)]"
                            style={{
                              backgroundColor:
                                completed
                                  ? '#D4AF37'
                                  : 'hsl(var(--border))',
                              opacity: completed ? 0.4 : 0.3,
                            }}
                          />
                        )}

                        {/* Icon Circle */}
                        <div className="relative z-10 shrink-0">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                            className={`
                              flex h-10 w-10 items-center justify-center rounded-full
                              transition-colors duration-300
                              ${
                                order.status === 'cancelled' && step.key === 'cancelled'
                                  ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-400 dark:ring-red-600'
                                  : completed
                                    ? 'bg-[#D4AF37] text-white'
                                    : 'bg-muted text-muted-foreground'
                              }
                            `}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                          {/* Pulse ring on active step */}
                          {active && order.status !== 'cancelled' && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-[#D4AF37]"
                              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                          {active && order.status === 'cancelled' && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-red-400 dark:border-red-600"
                              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-8 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3
                              className={`
                                text-sm font-semibold transition-colors
                                ${
                                  order.status === 'cancelled' && step.key === 'cancelled'
                                    ? 'text-red-600 dark:text-red-400'
                                    : completed
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                }
                              `}
                            >
                              {t(step.titleKey, locale)}
                            </h3>
                            {completed && order.status !== 'cancelled' && (
                              <CheckCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
                            )}
                            {order.status === 'cancelled' && step.key === 'cancelled' && (
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </div>

                          {step.key === 'shipped' && (active || completed) && (
                            <p className="text-xs font-medium text-[#D4AF37] mb-0.5">
                              {locale === 'id' ? 'Estimasi tiba: ' : 'Est. delivery: '}
                              {getEstimatedDate(order.createdAt, 5, locale)}
                            </p>
                          )}

                          {/* Date/time for active step */}
                          {active && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {formatDateTime(order.updatedAt, locale)}
                            </p>
                          )}
                          {completed && !active && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {formatDateTime(order.createdAt, locale)}
                            </p>
                          )}

                          <p
                            className={`
                              text-xs leading-relaxed
                              ${completed ? 'text-muted-foreground' : 'text-muted-foreground/60'}
                            `}
                          >
                            {t(step.descKey, locale)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ========== 3. Order Items ========== */}
          <motion.div variants={fadeInUp}>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
              {t('tracking.items', locale)}
            </h2>
            <Card className="border-border/50">
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-0 divide-y divide-border/50">
                  {order.items.map((item, idx) => (
                    <motion.div
                      key={item.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.format && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-5 font-normal"
                            >
                              {item.format}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(item.price, locale)}
                          </span>
                          <span className="text-xs text-muted-foreground">×</span>
                          <span className="text-xs text-muted-foreground">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {formatPrice(item.price * item.quantity, locale)}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Price Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('tracking.subtotal', locale)}
                    </span>
                    <span className="text-foreground">
                      {formatPrice(order.subtotal, locale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('tracking.shipping', locale)}
                    </span>
                    <span className="text-foreground">
                      {formatPrice(order.shippingCost, locale)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('tracking.discount', locale)}
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        -{formatPrice(order.discount, locale)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {t('tracking.total', locale)}
                    </span>
                    <span className="text-lg font-bold text-[#D4AF37]">
                      {formatPrice(order.total, locale)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ========== 4 & 5. Shipping Address & Payment Method ========== */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Shipping Address */}
            <motion.div variants={fadeInUp}>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                {t('tracking.shippingAddress', locale)}
              </h2>
              <Card className="border-border/50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t('tracking.receiver', locale)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {order.shippingName || '-'}
                      </p>
                    </div>
                  </div>

                  {order.shippingPhone && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {t('tracking.phone', locale)}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {order.shippingPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t('tracking.address', locale)}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {order.shippingAddr || '-'}
                      </p>
                      {order.shippingCity && (
                        <p className="text-sm text-muted-foreground">
                          {order.shippingCity}
                          {order.shippingCode ? ` ${order.shippingCode}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {order.expedition && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {t('tracking.expedition', locale)}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {order.expedition}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div variants={fadeInUp}>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                {t('tracking.paymentMethod', locale)}
              </h2>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      <CreditCard className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {t('tracking.paymentMethod', locale)}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {getPaymentLabel(order.paymentMethod, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(order.createdAt, locale)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Mini price summary */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t('tracking.subtotal', locale)}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(order.subtotal, locale)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {t('tracking.shipping', locale)}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(order.shippingCost, locale)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t('tracking.discount', locale)}
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          -{formatPrice(order.discount, locale)}
                        </span>
                      </div>
                    )}
                    <Separator className="!my-2" />
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {t('tracking.total', locale)}
                      </span>
                      <span className="text-sm font-bold text-[#D4AF37]">
                        {formatPrice(order.total, locale)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Back Button */}
          <motion.div variants={fadeInUp} className="pb-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto border-border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('tracking.backToOrders', locale)}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
