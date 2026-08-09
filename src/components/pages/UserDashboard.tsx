'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  Star,
  Award,
  Edit,
  Save,
  X,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
  TrendingUp,
  Truck,
  PackageCheck,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Book } from '@/types';
import BookCard from '@/components/BookCard';
import { toast } from 'sonner';

// --- Types ---
interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  format: string;
  bookId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface PointsHistoryEntry {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

interface TierInfo {
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

const TIERS: TierInfo[] = [
  { name: 'Bronze', min: 0, max: 499, color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', borderColor: 'border-amber-400', icon: '🥉' },
  { name: 'Silver', min: 500, max: 1999, color: 'text-gray-500 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-800', borderColor: 'border-gray-400', icon: '🥈' },
  { name: 'Gold', min: 2000, max: 4999, color: 'text-[#D4AF37]', bgColor: 'bg-[#D4AF37]/10', borderColor: 'border-[#D4AF37]', icon: '🥇' },
  { name: 'Platinum', min: 5000, max: Infinity, color: 'text-slate-400 dark:text-slate-200', bgColor: 'bg-slate-100 dark:bg-slate-800', borderColor: 'border-slate-400', icon: '💎' },
];

const MOCK_POINTS_HISTORY: PointsHistoryEntry[] = [
  { id: '1', type: 'earned', amount: 150, description: 'Purchase order #NVX-20250115', date: '2025-01-15' },
  { id: '2', type: 'earned', amount: 80, description: 'Purchase order #NVX-20250102', date: '2025-01-02' },
  { id: '3', type: 'redeemed', amount: -500, description: 'Redeemed Rp5,000 voucher', date: '2024-12-28' },
  { id: '4', type: 'earned', amount: 200, description: 'Purchase order #NVX-20241220', date: '2024-12-20' },
  { id: '5', type: 'earned', amount: 120, description: 'Purchase order #NVX-20241210', date: '2024-12-10' },
  { id: '6', type: 'earned', amount: 300, description: 'Purchase order #NVX-20241125', date: '2024-11-25' },
  { id: '7', type: 'redeemed', amount: -200, description: 'Redeemed Rp2,000 voucher', date: '2024-11-15' },
  { id: '8', type: 'earned', amount: 90, description: 'Purchase order #NVX-20241101', date: '2024-11-01' },
];

const STATUS_CONFIG: Record<string, { labelKey: string; color: string }> = {
  pending: { labelKey: 'dashboard.pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300' },
  processing: { labelKey: 'dashboard.processing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300' },
  shipped: { labelKey: 'dashboard.shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300' },
  delivered: { labelKey: 'dashboard.delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300' },
  cancelled: { labelKey: 'dashboard.cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300' },
};

// --- Component ---
export default function UserDashboard() {
  const { user, isAuthenticated, locale, pageParams, setPage, wishlist, setUser } = useAppStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPage('login');
    }
  }, [isAuthenticated, user, setPage]);

  const activeTab = pageParams.tab || 'profile';

  // --- Profile Edit State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const startEditing = useCallback(() => {
    if (!user) return;
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
    });
    setIsEditing(true);
  }, [user]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const saveProfile = useCallback(() => {
    if (!user) return;
    setUser({ ...user, ...editForm });
    setIsEditing(false);
    toast.success(locale === 'id' ? 'Profil berhasil diperbarui' : 'Profile updated successfully');
  }, [user, editForm, setUser, locale]);

  // --- Orders State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // --- Wishlist Books State ---
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchWishlistBooks = useCallback(async () => {
    if (wishlist.length === 0) {
      setWishlistBooks([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch(`/api/books?ids=${wishlist.join(',')}`);
      if (res.ok) {
        const data = await res.json();
        setWishlistBooks(data.books || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setWishlistLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlistBooks();
    }
  }, [activeTab, fetchWishlistBooks]);

  // --- Helpers ---
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentTier = (points: number): TierInfo => {
    return TIERS.find((tier) => points >= tier.min && points < tier.max) || TIERS[TIERS.length - 1];
  };

  const getNextTier = (points: number): TierInfo | null => {
    const currentIdx = TIERS.findIndex((tier) => points >= tier.min && points < tier.max);
    if (currentIdx === -1 || currentIdx === TIERS.length - 1) return null;
    return TIERS[currentIdx + 1];
  };

  const getTierProgress = (points: number): number => {
    const current = getCurrentTier(points);
    const next = getNextTier(points);
    if (!next) return 100;
    const range = next.min - current.min;
    const progress = points - current.min;
    return Math.min(Math.round((progress / range) * 100), 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Don't render until auth check is done
  if (!isAuthenticated || !user) {
    return null;
  }

  const currentTier = getCurrentTier(user.points);
  const nextTier = getNextTier(user.points);
  const tierProgress = getTierProgress(user.points);

  // --- Sidebar Tab Items ---
  const tabItems = [
    { value: 'profile', label: t('dashboard.profile', locale), icon: User },
    { value: 'orders', label: t('dashboard.orders', locale), icon: Package },
    { value: 'wishlist', label: t('dashboard.wishlist', locale), icon: Heart },
    { value: 'points', label: t('dashboard.points', locale), icon: Star },
  ];

  const handleTabChange = (value: string) => {
    setPage('dashboard', { tab: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t('dashboard.title', locale)}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {locale === 'id' ? 'Kelola akun dan lihat aktivitasmu' : 'Manage your account and view your activity'}
          </p>
        </div>

        {/* Desktop: Sidebar Layout */}
        <div className="hidden lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          {/* Sidebar */}
          <aside className="space-y-1">
            {tabItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleTabChange(item.value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.value === 'wishlist' && wishlist.length > 0 && (
                    <span className={`ml-auto text-xs rounded-full px-2 py-0.5 ${
                      isActive ? 'bg-[#D4AF37] text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {wishlist.length}
                    </span>
                  )}
                  {item.value === 'points' && (
                    <span className={`ml-auto text-xs font-semibold ${
                      isActive ? 'text-[#D4AF37]' : 'text-muted-foreground'
                    }`}>
                      {user.points.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileTab
                    user={user}
                    locale={locale}
                    isEditing={isEditing}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    onStartEdit={startEditing}
                    onCancelEdit={cancelEditing}
                    onSave={saveProfile}
                    getInitials={getInitials}
                  />
                </motion.div>
              )}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OrdersTab
                    orders={orders}
                    loading={ordersLoading}
                    locale={locale}
                    formatDate={formatDate}
                  />
                </motion.div>
              )}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WishlistTab
                    books={wishlistBooks}
                    loading={wishlistLoading}
                    locale={locale}
                  />
                </motion.div>
              )}
              {activeTab === 'points' && (
                <motion.div
                  key="points"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PointsTab
                    points={user.points}
                    currentTier={currentTier}
                    nextTier={nextTier}
                    tierProgress={tierProgress}
                    locale={locale}
                    formatDate={formatDate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: Horizontal Tabs */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full bg-muted/50 h-auto p-1 flex flex-wrap gap-1">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="flex items-center gap-1.5 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs px-3 py-2 rounded-md flex-1 justify-center"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <TabsContent value="profile" forceMount={activeTab === 'profile'}>
                  {activeTab === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProfileTab
                        user={user}
                        locale={locale}
                        isEditing={isEditing}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onStartEdit={startEditing}
                        onCancelEdit={cancelEditing}
                        onSave={saveProfile}
                        getInitials={getInitials}
                      />
                    </motion.div>
                  )}
                </TabsContent>
                <TabsContent value="orders" forceMount={activeTab === 'orders'}>
                  {activeTab === 'orders' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <OrdersTab
                        orders={orders}
                        loading={ordersLoading}
                        locale={locale}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  )}
                </TabsContent>
                <TabsContent value="wishlist" forceMount={activeTab === 'wishlist'}>
                  {activeTab === 'wishlist' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <WishlistTab
                        books={wishlistBooks}
                        loading={wishlistLoading}
                        locale={locale}
                      />
                    </motion.div>
                  )}
                </TabsContent>
                <TabsContent value="points" forceMount={activeTab === 'points'}>
                  {activeTab === 'points' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <PointsTab
                        points={user.points}
                        currentTier={currentTier}
                        nextTier={nextTier}
                        tierProgress={tierProgress}
                        locale={locale}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  )}
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}

// --- Profile Tab ---
interface ProfileTabProps {
  user: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    points: number;
  };
  locale: 'id' | 'en';
  isEditing: boolean;
  editForm: { name: string; phone: string; address: string; city: string; postalCode: string };
  setEditForm: React.Dispatch<React.SetStateAction<typeof editForm>>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  getInitials: (name: string) => string;
}

function ProfileTab({ user, locale, isEditing, editForm, setEditForm, onStartEdit, onCancelEdit, onSave, getInitials }: ProfileTabProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {t('dashboard.profile', locale)}
          </h2>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartEdit}
              className="gap-1.5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Edit className="h-3.5 w-3.5" />
              {t('dashboard.editProfile', locale)}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSave}
                className="gap-1.5 bg-[#D4AF37] text-white hover:bg-[#B8960C]"
              >
                <Save className="h-3.5 w-3.5" />
                {t('general.save', locale)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                {t('general.cancel', locale)}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar & Name Section */}
          <div className="flex flex-col items-center sm:items-start gap-4 sm:min-w-[200px]">
            <Avatar className="h-20 w-20 border-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20">
              <AvatarFallback className="bg-[#D4AF37] text-white text-2xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="max-w-[240px] h-9"
                />
              ) : (
                <h3 className="font-heading text-lg font-semibold text-foreground">{user.name}</h3>
              )}
              <div className="flex items-center gap-1.5 mt-1.5">
                <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-sm font-bold text-[#D4AF37]">
                  {user.points.toLocaleString()} {t('points.label', locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-4">
            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('auth.email', locale)}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('checkout.phone', locale)}
                  </p>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      className="h-9 mt-0.5"
                      placeholder="08xxxxxxxxxx"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {user.phone || (locale === 'id' ? 'Belum diisi' : 'Not set')}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('checkout.addressField', locale)}
                  </p>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                      className="h-9 mt-0.5"
                      placeholder={locale === 'id' ? 'Jl. Contoh No. 123' : '123 Example St.'}
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {user.address || (locale === 'id' ? 'Belum diisi' : 'Not set')}
                    </p>
                  )}
                </div>
              </div>

              {/* City */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('checkout.city', locale)}
                  </p>
                  {isEditing ? (
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                      className="h-9 mt-0.5"
                      placeholder={locale === 'id' ? 'Jakarta' : 'City'}
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {user.city || (locale === 'id' ? 'Belum diisi' : 'Not set')}
                    </p>
                  )}
                </div>
              </div>

              {/* Postal Code */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('checkout.postal', locale)}
                  </p>
                  {isEditing ? (
                    <Input
                      value={editForm.postalCode}
                      onChange={(e) => setEditForm((f) => ({ ...f, postalCode: e.target.value }))}
                      className="h-9 mt-0.5"
                      placeholder="12345"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {user.postalCode || (locale === 'id' ? 'Belum diisi' : 'Not set')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Orders Tab ---
interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  locale: 'id' | 'en';
  formatDate: (dateStr: string) => string;
}

function OrdersTab({ orders, loading, locale, formatDate }: OrdersTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyOrderNumber = (orderNumber: string, orderId: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopiedId(orderId);
      toast.success(t('dashboard.orderCopied', locale));
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Compute statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {t('dashboard.orderHistory', locale)}
        </h2>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-8 rounded-lg mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Orders skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
        {t('dashboard.orderHistory', locale)}
      </h2>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="relative mb-6">
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag className="h-10 w-10 text-[#D4AF37]" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#D4AF37]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            {t('dashboard.noOrders', locale)}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {locale === 'id'
              ? 'Mulai belanja dan pesananmu akan muncul di sini'
              : 'Start shopping and your orders will appear here'}
          </p>
          <Button
            onClick={() => useAppStore.getState().setPage('catalog')}
            className="mt-6 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white hover:from-[#B8960C] hover:to-[#9A7B0A] shadow-md shadow-[#D4AF37]/20"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {locale === 'id' ? 'Belanja Sekarang' : 'Shop Now'}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {/* Total Orders */}
            <Card className="border-border/50 border-l-4 border-l-[#D4AF37]">
              <CardContent className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 mb-2">
                  <Package className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.totalOrders', locale)}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{totalOrders}</p>
              </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="border-border/50 border-l-4 border-l-[#D4AF37]">
              <CardContent className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.totalSpent', locale)}</p>
                <p className="text-xl font-bold text-[#D4AF37] mt-0.5">{formatPrice(totalSpent, locale)}</p>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="border-border/50 border-l-4 border-l-[#D4AF37]">
              <CardContent className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2">
                  <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.activeOrders', locale)}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{activeOrders}</p>
              </CardContent>
            </Card>

            {/* Completed Orders */}
            <Card className="border-border/50 border-l-4 border-l-[#D4AF37]">
              <CardContent className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 mb-2">
                  <PackageCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{t('dashboard.completedOrders', locale)}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{completedOrders}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {orders.map((order, idx) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isCopied = copiedId === order.id;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="border-border/50 hover:border-[#D4AF37]/20 transition-colors">
                    <CardContent className="p-5">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {order.orderNumber}
                          </span>
                          <button
                            onClick={() => copyOrderNumber(order.orderNumber, order.id)}
                            className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-colors"
                            aria-label="Copy order number"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <Badge
                            variant="outline"
                            className={`${statusCfg.color} text-[11px] font-semibold border`}
                          >
                            {t(statusCfg.labelKey, locale)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 py-1.5"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.format} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-foreground shrink-0">
                              {formatPrice(item.price * item.quantity, locale)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator className="mb-3" />

                      {/* Total & Track */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t('cart.total', locale)}
                          </span>
                          <span className="text-base font-bold text-[#D4AF37]">
                            {formatPrice(order.total, locale)}
                          </span>
                        </div>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => useAppStore.getState().setPage('order-tracking', { orderNumber: order.orderNumber })}
                            className="gap-1.5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            {t('dashboard.trackOrder', locale)}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Wishlist Tab ---
interface WishlistTabProps {
  books: Book[];
  loading: boolean;
  locale: 'id' | 'en';
}

function WishlistTab({ books, loading, locale }: WishlistTabProps) {
  const wishlist = useAppStore((s) => s.wishlist);

  if (loading) {
    return (
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
          {t('dashboard.wishlist', locale)}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
        {t('dashboard.wishlist', locale)}
      </h2>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            {locale === 'id' ? 'Wishlist kosong' : 'Wishlist is empty'}
          </p>
          <p className="text-sm text-muted-foreground">
            {locale === 'id'
              ? 'Simpan novel favoritmu agar mudah ditemukan'
              : 'Save your favorite novels for easy access'}
          </p>
          <Button
            onClick={() => useAppStore.getState().setPage('catalog')}
            className="mt-6 bg-[#D4AF37] text-white hover:bg-[#B8960C]"
          >
            {locale === 'id' ? 'Jelajahi Katalog' : 'Explore Catalog'}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book, idx) => (
            <BookCard key={book.id} book={book} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Points Tab ---
interface PointsTabProps {
  points: number;
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  tierProgress: number;
  locale: 'id' | 'en';
  formatDate: (dateStr: string) => string;
}

function PointsTab({ points, currentTier, nextTier, tierProgress, locale, formatDate }: PointsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {t('dashboard.points', locale)}
      </h2>

      {/* Points Summary Card */}
      <Card className="border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Award className="h-10 w-10 text-[#D4AF37]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-muted-foreground mb-1">
                {locale === 'id' ? 'Total Poin Kamu' : 'Your Total Points'}
              </p>
              <p className="text-4xl font-bold text-[#D4AF37] font-heading">
                {points.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {locale === 'id'
                  ? `Tier saat ini: `
                  : 'Current tier: '}
                <span className={`font-semibold ${currentTier.color}`}>
                  {currentTier.icon} {currentTier.name}
                </span>
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Tier Progress */}
          {nextTier && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${currentTier.color}`}>
                  {currentTier.icon} {currentTier.name}
                </span>
                <span className="text-muted-foreground">
                  <ChevronRight className="inline h-4 w-4" />
                </span>
                <span className={`font-medium ${nextTier.color}`}>
                  {nextTier.icon} {nextTier.name}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={tierProgress}
                  className="h-3 bg-muted rounded-full"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#D4AF37] border-2 border-background shadow-md transition-all duration-500"
                  style={{ left: `calc(${tierProgress}% - 10px)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentTier.min.toLocaleString()}</span>
                <span>{locale === 'id'
                  ? `${(nextTier.min - points).toLocaleString()} poin lagi`
                  : `${(nextTier.min - points).toLocaleString()} points to go`}
                </span>
                <span>{nextTier.min.toLocaleString()}</span>
              </div>
            </div>
          )}

          {!nextTier && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {locale === 'id'
                  ? '🎉 Kamu sudah mencapai tier tertinggi!'
                  : '🎉 You\'ve reached the highest tier!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Overview */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {locale === 'id' ? 'Tier Overview' : 'Tier Overview'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIERS.map((tier) => {
              const isCurrentTier = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    isCurrentTier
                      ? `${tier.bgColor} ${tier.borderColor} border-2 shadow-md`
                      : 'border-border/50 bg-card'
                  }`}
                >
                  <span className="text-2xl">{tier.icon}</span>
                  <p className={`text-sm font-semibold mt-1.5 ${isCurrentTier ? tier.color : 'text-foreground'}`}>
                    {tier.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tier.max === Infinity
                      ? `${tier.min.toLocaleString()}+`
                      : `${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}`}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {locale === 'id' ? 'Riwayat Poin' : 'Points History'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {MOCK_POINTS_HISTORY.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="flex items-center gap-4 py-2.5"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    entry.type === 'earned'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {entry.type === 'earned' ? (
                    <Star className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(entry.date)}
                  </div>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    entry.type === 'earned'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
