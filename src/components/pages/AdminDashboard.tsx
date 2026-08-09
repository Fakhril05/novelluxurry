'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Book, Category } from '@/types';
import { toast } from 'sonner';

// --- Types ---
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  userName: string;
  userEmail: string;
  itemCount: number;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  points: number;
  _count?: { orders: number };
  createdAt: string;
}

interface BookFormData {
  title: string;
  author: string;
  authorBio: string;
  isbn: string;
  synopsis: string;
  coverImage: string;
  price: string;
  discountPrice: string;
  stock: string;
  format: string;
  pages: string;
  publisher: string;
  language: string;
  publishedYear: string;
  categoryId: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
}

// --- Mock Data ---
const MOCK_SALES_DATA = [
  { month: 'Jan', sales: 4200000 },
  { month: 'Feb', sales: 5800000 },
  { month: 'Mar', sales: 4900000 },
  { month: 'Apr', sales: 7200000 },
  { month: 'Mei', sales: 6100000 },
  { month: 'Jun', sales: 8400000 },
  { month: 'Jul', sales: 9200000 },
  { month: 'Agu', sales: 7800000 },
  { month: 'Sep', sales: 10500000 },
  { month: 'Okt', sales: 11200000 },
  { month: 'Nov', sales: 9800000 },
  { month: 'Des', sales: 12500000 },
];

const STATUS_CONFIG: Record<string, { labelKey: string; color: string }> = {
  pending: {
    labelKey: 'dashboard.pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
  },
  processing: {
    labelKey: 'dashboard.processing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
  },
  shipped: {
    labelKey: 'dashboard.shipped',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300',
  },
  delivered: {
    labelKey: 'dashboard.delivered',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300',
  },
  cancelled: {
    labelKey: 'dashboard.cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300',
  },
};

const EMPTY_BOOK_FORM: BookFormData = {
  title: '',
  author: '',
  authorBio: '',
  isbn: '',
  synopsis: '',
  coverImage: '',
  price: '',
  discountPrice: '',
  stock: '',
  format: 'Paperback',
  pages: '',
  publisher: '',
  language: 'Indonesia',
  publishedYear: '',
  categoryId: '',
  isBestSeller: false,
  isNewArrival: false,
  isFeatured: false,
};

const EMPTY_CATEGORY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image: '',
};

// --- Helper ---
function formatDate(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Helper to extract error message from API response
function getErrorMessage(data: { error?: string; details?: string[] }): string {
  if (data.details && data.details.length > 0) {
    return data.details.join('; ');
  }
  return data.error || 'An error occurred';
}

// ============================================================================
// Dashboard/Stats Tab
// ============================================================================
function StatsTab({
  locale,
  books,
  orders,
  users,
}: {
  locale: string;
  books: Book[];
  orders: Order[];
  users: AdminUser[];
}) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSold = books.reduce((sum, b) => sum + b.soldCount, 0);
  const newOrders = orders.filter((o) => o.status === 'pending').length;

  const statCards = [
    {
      label: t('admin.totalSales', locale as 'id' | 'en'),
      value: totalSold.toLocaleString(),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: t('admin.totalCustomers', locale as 'id' | 'en'),
      value: users.length.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: t('admin.revenue', locale as 'id' | 'en'),
      value: formatPrice(totalRevenue, locale as 'id' | 'en'),
      icon: DollarSign,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/10',
    },
    {
      label: t('admin.newOrders', locale as 'id' | 'en'),
      value: newOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color.replace('text-', 'bg-').replace('-600', '-500')}`} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {t('admin.salesChart', locale as 'id' | 'en')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    locale === 'id' ? `${(v / 1000000).toFixed(0)}jt` : `${(v / 1000000).toFixed(0)}M`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '13px',
                  }}
                  formatter={(value: number) => [formatPrice(value, locale as 'id' | 'en'), locale === 'id' ? 'Penjualan' : 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            {t('admin.recentOrders', locale as 'id' | 'en')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.orderNumber', locale as 'id' | 'en')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('admin.customer', locale as 'id' | 'en')}</TableHead>
                  <TableHead>{t('admin.total', locale as 'id' | 'en')}</TableHead>
                  <TableHead>{t('admin.status', locale as 'id' | 'en')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.date', locale as 'id' | 'en')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('admin.noOrders', locale as 'id' | 'en')}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.userName}</TableCell>
                        <TableCell className="font-semibold text-[#D4AF37]">
                          {formatPrice(order.total, locale as 'id' | 'en')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.color}>
                            {t(cfg.labelKey, locale as 'id' | 'en')}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Books Tab (CRUD) with Search/Filter
// ============================================================================
function BooksTab({
  locale,
  books,
  categories,
  onRefresh,
}: {
  locale: string;
  books: Book[];
  categories: Category[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormData>(EMPTY_BOOK_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply filters
  const filteredBooks = books.filter((book) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !book.title.toLowerCase().includes(q) &&
        !book.author.toLowerCase().includes(q) &&
        !(book.isbn && book.isbn.toLowerCase().includes(q))
      ) return false;
    }
    if (filterCategory !== 'all' && book.categoryId !== filterCategory) return false;
    if (filterFormat !== 'all' && book.format !== filterFormat) return false;
    if (filterStatus === 'bestseller' && !book.isBestSeller) return false;
    if (filterStatus === 'newArrival' && !book.isNewArrival) return false;
    if (filterStatus === 'featured' && !book.isFeatured) return false;
    if (filterStatus === 'outOfStock' && book.stock !== 0) return false;
    return true;
  });

  // Sort
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'titleAsc': return a.title.localeCompare(b.title);
      case 'titleDesc': return b.title.localeCompare(a.title);
      case 'priceAsc': return a.price - b.price;
      case 'priceDesc': return b.price - a.price;
      case 'stockAsc': return a.stock - b.stock;
      case 'stockDesc': return b.stock - a.stock;
      case 'soldDesc': return b.soldCount - a.soldCount;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const L = locale as 'id' | 'en';

  const openAddDialog = useCallback(() => {
    setEditingBook(null);
    setForm(EMPTY_BOOK_FORM);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      authorBio: book.authorBio || '',
      isbn: book.isbn || '',
      synopsis: book.synopsis || '',
      coverImage: book.coverImage,
      price: String(book.price),
      discountPrice: book.discountPrice ? String(book.discountPrice) : '',
      stock: String(book.stock),
      format: book.format,
      pages: book.pages ? String(book.pages) : '',
      publisher: book.publisher || '',
      language: book.language,
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      categoryId: book.categoryId || '',
      isBestSeller: book.isBestSeller,
      isNewArrival: book.isNewArrival,
      isFeatured: book.isFeatured,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.title || !form.author || !form.price) {
      toast.error(t('admin.titleAuthorPriceRequired', L));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
        pages: form.pages ? Number(form.pages) : null,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      };

      let res: Response;
      if (editingBook) {
        res = await fetch(`/api/admin/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingBook ? t('admin.bookUpdated', L) : t('admin.bookAdded', L));
        setDialogOpen(false);
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(getErrorMessage(data));
      }
    } catch {
      toast.error(t('general.error', L));
    } finally {
      setSaving(false);
    }
  }, [form, editingBook, L, onRefresh]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    setDeleteErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/books/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('admin.bookDeleted', L));
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        setDeleteErrorMsg(getErrorMessage(data));
        toast.error(t('admin.deleteBookFailed', L));
      }
    } catch {
      toast.error(t('general.error', L));
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, L, onRefresh]);

  const getCategoryName = (catId: string | null) => {
    if (!catId) return '-';
    return categories.find((c) => c.id === catId)?.name || '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-heading text-xl font-bold">
          {t('admin.manageBooks', L)}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({sortedBooks.length})</span>
        </h2>
        <Button onClick={openAddDialog} className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addBook', L)}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.searchBooks', L)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.filterCategory', L)}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.filterFormat', L)}</SelectItem>
                  <SelectItem value="Paperback">Paperback</SelectItem>
                  <SelectItem value="Hardcover">Hardcover</SelectItem>
                  <SelectItem value="Ebook">Ebook</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.filterStatus', L)}</SelectItem>
                  <SelectItem value="bestseller">{t('admin.statusBestseller', L)}</SelectItem>
                  <SelectItem value="newArrival">{t('admin.statusNewArrival', L)}</SelectItem>
                  <SelectItem value="featured">{t('admin.statusFeatured', L)}</SelectItem>
                  <SelectItem value="outOfStock">{t('admin.statusOutOfStock', L)}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('admin.sortNewest', L)}</SelectItem>
                  <SelectItem value="titleAsc">{t('admin.sortTitleAsc', L)}</SelectItem>
                  <SelectItem value="titleDesc">{t('admin.sortTitleDesc', L)}</SelectItem>
                  <SelectItem value="priceAsc">{t('admin.sortPriceAsc', L)}</SelectItem>
                  <SelectItem value="priceDesc">{t('admin.sortPriceDesc', L)}</SelectItem>
                  <SelectItem value="stockAsc">{t('admin.sortStockAsc', L)}</SelectItem>
                  <SelectItem value="stockDesc">{t('admin.sortStockDesc', L)}</SelectItem>
                  <SelectItem value="soldDesc">{t('admin.sortBestseller', L)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingBook ? t('admin.editBook', L) : t('admin.addNewBook', L)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.title', L)} *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t('admin.title', L)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.author', L)} *</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder={t('admin.author', L)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ISBN</Label>
                <Input
                  value={form.isbn}
                  onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                  placeholder="978-xxx-xxx-xxx"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.category', L)}</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('admin.filterCategory', L)} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.price', L)} (IDR) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="89000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.discountPrice', L)}</Label>
                <Input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
                  placeholder={L === 'id' ? 'Opsional' : 'Optional'}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.stock', L)}</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('book.format', L)}</Label>
                <Select
                  value={form.format}
                  onValueChange={(v) => setForm((f) => ({ ...f, format: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paperback">Paperback</SelectItem>
                    <SelectItem value="Hardcover">Hardcover</SelectItem>
                    <SelectItem value="Ebook">Ebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('book.pages', L)}</Label>
                <Input
                  type="number"
                  value={form.pages}
                  onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                  placeholder="320"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('book.language', L)}</Label>
                <Input
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  placeholder="Indonesia"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('book.publisher', L)}</Label>
                <Input
                  value={form.publisher}
                  onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
                  placeholder={t('book.publisher', L)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('book.year', L)}</Label>
                <Input
                  type="number"
                  value={form.publishedYear}
                  onChange={(e) => setForm((f) => ({ ...f, publishedYear: e.target.value }))}
                  placeholder="2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{L === 'id' ? 'URL Cover Image' : 'Cover Image URL'}</Label>
              <Input
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>{L === 'id' ? 'Bio Penulis' : 'Author Bio'}</Label>
              <Textarea
                value={form.authorBio}
                onChange={(e) => setForm((f) => ({ ...f, authorBio: e.target.value }))}
                placeholder={L === 'id' ? 'Tentang penulis...' : 'About the author...'}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('book.synopsis', L)}</Label>
              <Textarea
                value={form.synopsis}
                onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))}
                placeholder={L === 'id' ? 'Sinopsis buku...' : 'Book synopsis...'}
                rows={4}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBestSeller}
                  onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))}
                  className="rounded border-input accent-[#D4AF37]"
                />
                {t('admin.bestseller', L)}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))}
                  className="rounded border-input accent-[#D4AF37]"
                />
                {t('admin.newArrival', L)}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded border-input accent-[#D4AF37]"
                />
                {t('admin.featured', L)}
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('general.cancel', L)}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
              >
                {saving ? t('general.loading', L) : t('general.save', L)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Books Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.cover', L)}</TableHead>
                  <TableHead>{t('admin.title', L)}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.author', L)}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('admin.category', L)}</TableHead>
                  <TableHead>{t('admin.price', L)}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('admin.stock', L)}</TableHead>
                  <TableHead>{t('admin.status', L)}</TableHead>
                  <TableHead className="text-right">{t('admin.actions', L)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p>{t('admin.noBooks', L)}</p>
                        <p className="text-sm mt-1">{t('admin.noBooksDesc', L)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div className="w-10 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-[180px] truncate">{book.title}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{book.author}</TableCell>
                      <TableCell className="hidden lg:table-cell">{getCategoryName(book.categoryId)}</TableCell>
                      <TableCell>
                        <div className="text-[#D4AF37] font-semibold">
                          {formatPrice(book.discountPrice || book.price, L)}
                        </div>
                        {book.discountPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(book.price, L)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={book.stock > 10 ? 'text-green-600' : book.stock > 0 ? 'text-yellow-600' : 'text-red-600'}>
                          {book.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {book.isBestSeller && (
                            <Badge variant="outline" className="text-xs border-[#D4AF37] text-[#D4AF37]">
                              {t('badge.bestseller', L)}
                            </Badge>
                          )}
                          {book.isNewArrival && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                              {t('badge.new', L)}
                            </Badge>
                          )}
                          {book.isFeatured && (
                            <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                              {t('admin.featured', L)}
                            </Badge>
                          )}
                          {!book.isBestSeller && !book.isNewArrival && !book.isFeatured && book.stock === 0 && (
                            <Badge variant="outline" className="text-xs border-red-300 text-red-500">
                              {t('admin.statusOutOfStock', L)}
                            </Badge>
                          )}
                          {!book.isBestSeller && !book.isNewArrival && !book.isFeatured && book.stock > 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(book)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deletingId === book.id} onOpenChange={(open) => { if (!open) { setDeletingId(null); setDeleteErrorMsg(null); } }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => { setDeletingId(book.id); setDeleteErrorMsg(null); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('admin.deleteBook', L)}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {deleteErrorMsg || (
                                    L === 'id'
                                      ? `Apakah Anda yakin ingin menghapus "${book.title}"? Tindakan ini tidak dapat dibatalkan.`
                                      : `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('general.cancel', L)}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t('admin.delete', L)}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Categories Tab (CRUD)
// ============================================================================
function CategoriesTab({
  locale,
  categories,
  onRefresh,
}: {
  locale: string;
  categories: Category[];
  onRefresh: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_CATEGORY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const L = locale as 'id' | 'en';

  const openAddDialog = useCallback(() => {
    setEditingCat(null);
    setForm(EMPTY_CATEGORY_FORM);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((cat: Category) => {
    setEditingCat(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name || !form.slug) {
      toast.error(t('admin.nameAndSlugRequired', L));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        nameEn: form.name,
        slug: form.slug,
        description: form.description || null,
        image: form.image || null,
      };

      let res: Response;
      if (editingCat) {
        res = await fetch(`/api/admin/categories/${editingCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingCat ? t('admin.categoryUpdated', L) : t('admin.categoryAdded', L));
        setDialogOpen(false);
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(getErrorMessage(data));
      }
    } catch {
      toast.error(t('general.error', L));
    } finally {
      setSaving(false);
    }
  }, [form, editingCat, L, onRefresh]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    setDeleteErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/categories/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('admin.categoryDeleted', L));
        onRefresh();
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        setDeleteErrorMsg(getErrorMessage(data));
        toast.error(t('admin.deleteCategoryFailed', L));
      }
    } catch {
      toast.error(t('general.error', L));
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, L, onRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">
          {t('admin.manageCategories', L)}
        </h2>
        <Button onClick={openAddDialog} className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addCategory', L)}
        </Button>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingCat ? t('admin.editCategory', L) : t('admin.addNewCategory', L)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.name', L)} *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={L === 'id' ? 'Contoh: Romansa' : 'e.g., Romance'}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder={L === 'id' ? 'contoh: romansa' : 'e.g., romance'}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.description', L)}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={L === 'id' ? 'Deskripsi kategori...' : 'Category description...'}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{L === 'id' ? 'URL Gambar' : 'Image URL'}</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('general.cancel', L)}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
              >
                {saving ? t('general.loading', L) : t('general.save', L)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name', L)}</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('admin.description', L)}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.books', L)}</TableHead>
                  <TableHead className="text-right">{t('admin.actions', L)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('admin.noCategories', L)}
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{cat.slug}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                        {cat.description || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{cat._count?.books || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deletingId === cat.id} onOpenChange={(open) => { if (!open) { setDeletingId(null); setDeleteErrorMsg(null); } }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => { setDeletingId(cat.id); setDeleteErrorMsg(null); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('admin.deleteCategory', L)}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {deleteErrorMsg || (
                                    L === 'id'
                                      ? `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`
                                      : `Are you sure you want to delete "${cat.name}" category?`
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('general.cancel', L)}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t('admin.delete', L)}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Orders Tab
// ============================================================================
function OrdersTab({
  locale,
  orders,
  onRefresh,
}: {
  locale: string;
  orders: Order[];
  onRefresh: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const L = locale as 'id' | 'en';

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      setUpdatingId(orderId);
      try {
        const res = await fetch(`/api/orders?id=${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          toast.success(t('admin.orderStatusUpdated', L));
          onRefresh();
        } else {
          toast.error(t('admin.statusUpdateFailed', L));
        }
      } catch {
        toast.error(t('general.error', L));
      } finally {
        setUpdatingId(null);
      }
    },
    [L, onRefresh],
  );

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">
        {t('admin.allOrders', L)}
      </h2>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.orderNumber', L)}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('admin.customer', L)}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.items', L)}</TableHead>
                  <TableHead>{t('admin.total', L)}</TableHead>
                  <TableHead>{t('admin.status', L)}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('admin.date', L)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin.noOrders', L)}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <div className="font-medium">{order.userName}</div>
                            <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            <span>{order.itemCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-[#D4AF37]">
                          {formatPrice(order.total, L)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) => handleStatusChange(order.id, v)}
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <Badge variant="outline" className={`${cfg.color} text-[10px] px-1.5 py-0`}>
                                <SelectValue />
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">{t('dashboard.pending', L)}</SelectItem>
                              <SelectItem value="processing">{t('dashboard.processing', L)}</SelectItem>
                              <SelectItem value="shipped">{t('dashboard.shipped', L)}</SelectItem>
                              <SelectItem value="delivered">{t('dashboard.delivered', L)}</SelectItem>
                              <SelectItem value="cancelled">{t('dashboard.cancelled', L)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(order.createdAt, locale)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Users Tab
// ============================================================================
function UsersTab({
  locale,
  users,
}: {
  locale: string;
  users: AdminUser[];
}) {
  const L = locale as 'id' | 'en';

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">
        {t('admin.customers', L)}
      </h2>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name', L)}</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.points', L)}</TableHead>
                  <TableHead>{t('admin.orders', L)}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('admin.joined', L)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('admin.noCustomers', L)}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-[#D4AF37]">
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-[#D4AF37] font-semibold">{u.points.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-1">{t('points.label', L)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{u._count?.orders || 0}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(u.createdAt, locale)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main AdminDashboard Component
// ============================================================================
export default function AdminDashboard() {
  const { user, isAuthenticated, locale, pageParams, setPage } = useAppStore();

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      setPage('home');
    }
  }, [isAuthenticated, user, setPage]);

  const activeTab = pageParams.tab || 'stats';

  // --- Data States ---
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Functions ---
  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/books?limit=100');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?limit=100');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([fetchBooks(), fetchCategories(), fetchOrders(), fetchUsers()]);
    setLoading(false);
  }, [fetchBooks, fetchCategories, fetchOrders, fetchUsers]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadAll(); }, [loadAll]);

  // --- Don't render until auth check is done ---
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const handleTabChange = (value: string) => {
    setPage('admin', { tab: value });
  };

  const L = locale as 'id' | 'en';

  // --- Sidebar Tab Items ---
  const tabItems = [
    { value: 'stats', label: t('dashboard.title', L), icon: LayoutDashboard },
    { value: 'books', label: L === 'id' ? 'Buku' : 'Books', icon: BookOpen },
    { value: 'categories', label: t('nav.categories', L), icon: Package },
    { value: 'orders', label: t('admin.orders', L), icon: ShoppingBag },
    { value: 'users', label: t('nav.loyalty', L).replace('Program ', '').replace('Loyalty ', '').replace('Loyalitas ', '') || t('admin.customers', L), icon: Users },
  ];

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
            {t('nav.admin', L)}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('admin.manageStore', L)}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        ) : (
          <>
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
                      {item.value === 'orders' && orders.length > 0 && (
                        <span
                          className={`ml-auto text-xs rounded-full px-2 py-0.5 ${
                            isActive
                              ? 'bg-[#D4AF37] text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {orders.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </aside>

              {/* Content */}
              <div>
                <AnimatePresence mode="wait">
                  {activeTab === 'stats' && (
                    <motion.div
                      key="stats"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                    <StatsTab locale={locale} books={books} orders={orders} users={users} />
                    </motion.div>
                  )}
                  {activeTab === 'books' && (
                    <motion.div
                      key="books"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BooksTab locale={locale} books={books} categories={categories} onRefresh={loadAll} />
                    </motion.div>
                  )}
                  {activeTab === 'categories' && (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CategoriesTab locale={locale} categories={categories} onRefresh={loadAll} />
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
                      <OrdersTab locale={locale} orders={orders} onRefresh={loadAll} />
                    </motion.div>
                  )}
                  {activeTab === 'users' && (
                    <motion.div
                      key="users"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UsersTab locale={locale} users={users} />
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
                        className="flex items-center gap-1.5 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white text-xs sm:text-sm"
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="stats">
                  <div className="mt-4">
                    <StatsTab locale={locale} books={books} orders={orders} users={users} />
                  </div>
                </TabsContent>
                <TabsContent value="books">
                  <div className="mt-4">
                    <BooksTab locale={locale} books={books} categories={categories} onRefresh={loadAll} />
                  </div>
                </TabsContent>
                <TabsContent value="categories">
                  <div className="mt-4">
                    <CategoriesTab locale={locale} categories={categories} onRefresh={loadAll} />
                  </div>
                </TabsContent>
                <TabsContent value="orders">
                  <div className="mt-4">
                    <OrdersTab locale={locale} orders={orders} onRefresh={loadAll} />
                  </div>
                </TabsContent>
                <TabsContent value="users">
                  <div className="mt-4">
                    <UsersTab locale={locale} users={users} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
