'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  TrendingUp,
  SearchX,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import BookCard from '@/components/BookCard';
import type { Book, Category } from '@/types';

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'catalog.sort.newest' },
  { value: 'bestseller', labelKey: 'catalog.sort.bestseller' },
  { value: 'priceLow', labelKey: 'catalog.sort.priceLow' },
  { value: 'priceHigh', labelKey: 'catalog.sort.priceHigh' },
  { value: 'rating', labelKey: 'catalog.sort.rating' },
];

interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
}

interface FilterState {
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: string;
}

type ViewMode = 'grid' | 'list';

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === star ? 0 : star)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded"
          aria-label={`${star} stars`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || value)
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">{value}+</span>
      )}
    </div>
  );
}

function FilterSidebar({
  categories,
  filters,
  onFilterChange,
  onReset,
  locale,
}: {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: Record<string, unknown>) => void;
  onReset: () => void;
  locale: 'id' | 'en';
}) {
  const [localPriceMin, setLocalPriceMin] = useState(
    filters.minPrice ? String(filters.minPrice) : ''
  );
  const [localPriceMax, setLocalPriceMax] = useState(
    filters.maxPrice ? String(filters.maxPrice) : ''
  );

  const handlePriceSubmit = () => {
    const min = localPriceMin ? parseInt(localPriceMin, 10) : undefined;
    const max = localPriceMax ? parseInt(localPriceMax, 10) : undefined;
    onFilterChange({ minPrice: min, maxPrice: max });
  };

  const selectedGenres = filters.genre
    ? filters.genre.split(',').filter(Boolean)
    : [];

  const toggleGenre = (slug: string) => {
    const updated = selectedGenres.includes(slug)
      ? selectedGenres.filter((g) => g !== slug)
      : [...selectedGenres, slug];
    onFilterChange({ genre: updated.length > 0 ? updated.join(',') : undefined });
  };

  return (
    <div className="space-y-6 border-t-2 border-[#D4AF37]/20 pt-6">
      {/* Sort */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground border-l-2 border-[#D4AF37] pl-3">
          {t('catalog.sort', locale)}
        </h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ sort: opt.value })}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                filters.sort === opt.value
                  ? 'bg-gradient-to-r from-[#D4AF37]/15 to-[#D4AF37]/5 text-[#D4AF37] font-medium border border-[#D4AF37]/30 shadow-sm shadow-[#D4AF37]/10'
                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-[#D4AF37]/5 hover:to-transparent hover:text-foreground border border-transparent'
              }`}
            >
              {t(opt.labelKey, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#D4AF37]/10" />

      {/* Genre */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground border-l-2 border-[#D4AF37] pl-3">
          {t('catalog.filter.genre', locale)}
        </h3>
        <ScrollArea className="max-h-56 overflow-y-auto">
          <div className="space-y-2.5 pr-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Checkbox
                  checked={selectedGenres.includes(cat.slug)}
                  onCheckedChange={() => toggleGenre(cat.slug)}
                  className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37] data-[state=checked]:text-white border-2 border-muted-foreground/30 data-[state=checked]:shadow-sm data-[state=checked]:shadow-[#D4AF37]/30"
                />
                <span className={`text-sm transition-colors flex-1 ${
                  selectedGenres.includes(cat.slug)
                    ? 'text-[#D4AF37] font-medium'
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  {locale === 'en' && cat.nameEn ? cat.nameEn : cat.name}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {cat._count?.books || 0}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Divider */}
      <div className="border-t border-[#D4AF37]/10" />

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground border-l-2 border-[#D4AF37] pl-3">
          {t('catalog.filter.price', locale)}
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
            className="h-9 text-sm focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20"
            onKeyDown={(e) => e.key === 'Enter' && handlePriceSubmit()}
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
            className="h-9 text-sm focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20"
            onKeyDown={(e) => e.key === 'Enter' && handlePriceSubmit()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePriceSubmit}
          className="mt-2 w-full h-8 text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
        >
          {t('catalog.filter.apply', locale)}
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-[#D4AF37]/10" />

      {/* Rating */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground border-l-2 border-[#D4AF37] pl-3">
          {t('catalog.filter.rating', locale)}
        </h3>
        <StarSelector
          value={filters.minRating || 0}
          onChange={(val) => onFilterChange({ minRating: val || undefined })}
        />
      </div>

      {/* Reset */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-full text-muted-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
        >
          {t('catalog.filter.reset', locale)}
        </Button>
      </div>
    </div>
  );
}

/* ─── List View Card ─── */
function BookListItem({ book, index }: { book: Book; index: number }) {
  const { locale, setPage, wishlist, toggleWishlist } = useAppStore();
  const hasDiscount = book.discountPrice && book.discountPrice < book.price;
  const isWished = wishlist.includes(book.id);

  const handleCardClick = () => {
    setPage('book', { slug: book.slug });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      onClick={handleCardClick}
      className="group flex gap-4 p-3 rounded-xl border border-border/60 bg-background hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/5 cursor-pointer transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative w-20 h-28 sm:w-24 sm:h-36 shrink-0 rounded-lg overflow-hidden shadow-md">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {book.isNewArrival && (
          <Badge className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0 bg-[#D4AF37] text-white border-0 shadow-sm">
            NEW
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-[11px] text-[#D4AF37]/70 font-medium uppercase tracking-wider mb-0.5">
            {book.category?.name || book.author}
          </p>
          <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {book.author}
          </p>
          {book.synopsis && (
            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 hidden sm:block">
              {book.synopsis}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-xs font-medium text-foreground">{book.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({book.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-sm font-bold text-[#D4AF37]">
                    {formatPrice(book.discountPrice!, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(book.price, locale)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(book.price, locale)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(book.id);
              }}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all"
              aria-label="Toggle wishlist"
            >
              <Star
                className={`h-3.5 w-3.5 transition-colors ${
                  isWished
                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-3 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
}

function BookListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 rounded-xl border border-border/60">
          <Skeleton className="w-20 h-28 sm:w-24 sm:h-36 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full max-w-sm hidden sm:block" />
            <div className="flex items-center justify-between mt-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Enhanced Empty State ─── */
function EmptyState({ locale, onReset }: { locale: 'id' | 'en'; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      {/* Pulsing gold circle with SearchX icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        {/* Outer pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-[#D4AF37]/10"
        />
        {/* Middle pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.1, 0.25] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute -inset-2 rounded-full bg-[#D4AF37]/8"
        />
        {/* Icon circle */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/30 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10"
        >
          <SearchX className="h-9 w-9 text-[#D4AF37]" strokeWidth={1.5} />
        </motion.div>
        {/* Floating sparkles */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#D4AF37]/15 flex items-center justify-center"
        >
          <Sparkles className="h-3 w-3 text-[#D4AF37]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-1 -left-2 h-5 w-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center"
        >
          <Star className="h-2.5 w-2.5 text-[#D4AF37]" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <h3 className="font-heading text-xl font-bold text-foreground mb-2">
        {t('catalog.noResults', locale)}
      </h3>

      {/* Descriptive text */}
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        {locale === 'id'
          ? 'Sepertinya tidak ada novel yang cocok dengan filter kamu. Coba ubah kata kunci atau sesuaikan filter untuk menemukan buku yang kamu cari.'
          : 'It seems no novels match your current filters. Try adjusting your search keywords or refining the filters to discover the books you\'re looking for.'}
      </p>

      {/* Gold CTA */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onReset}
          className="bg-gradient-to-r from-[#D4AF37] to-[#C49B2E] text-white hover:from-[#C49B2E] hover:to-[#B8960C] shadow-lg shadow-[#D4AF37]/25 px-8 py-2.5 rounded-full font-medium"
        >
          {locale === 'id' ? 'Reset Semua Filter' : 'Reset All Filters'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function CatalogPage() {
  const { locale, pageParams, setPage, filters, setFilters, resetFilters } =
    useAppStore();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pageJumpInput, setPageJumpInput] = useState('');

  // Sync genre from pageParams on mount
  useEffect(() => {
    if (pageParams.genre && !filters.genre) {
      setFilters({ genre: pageParams.genre });
    }
    if (pageParams.search) {
      setSearchInput(pageParams.search);
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset to page 1 when filters change (except page itself)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.genre, filters.minPrice, filters.maxPrice, filters.minRating, filters.sort, pageParams.search]);

  // Fetch books
  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', String(LIMIT));
        params.set('page', String(currentPage));

        if (filters.genre) params.set('genre', filters.genre);
        if (filters.minPrice !== undefined && filters.minPrice > 0)
          params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== undefined && filters.maxPrice > 0)
          params.set('maxPrice', String(filters.maxPrice));
        if (filters.minRating !== undefined && filters.minRating > 0)
          params.set('minRating', String(filters.minRating));
        if (filters.sort) params.set('sort', filters.sort);
        if (pageParams.search) params.set('search', pageParams.search);

        const res = await fetch(`/api/books?${params.toString()}`);
        if (res.ok && !cancelled) {
          const data: BooksResponse = await res.json();
          setBooks(data.books || []);
          setTotal(data.total || 0);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doFetch();
    return () => {
      cancelled = true;
    };
  }, [filters, currentPage, pageParams.search]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleFilterChange = useCallback(
    (newFilters: Record<string, unknown>) => {
      setFilters(newFilters as Partial<FilterState>);
    },
    [setFilters]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setSearchInput('');
    setCurrentPage(1);
    setPage('catalog', {});
  }, [resetFilters, setPage]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage('catalog', { ...pageParams, search: searchInput.trim() });
      setCurrentPage(1);
    },
    [searchInput, pageParams, setPage]
  );

  const handlePageJump = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseInt(pageJumpInput, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setCurrentPage(val);
        setPageJumpInput('');
      }
    },
    [pageJumpInput, totalPages]
  );

  // Active filter badges
  const activeFilters = useMemo(() => {
    const items: { key: string; label: string; clear: () => void }[] = [];

    if (filters.genre) {
      const slugs = filters.genre.split(',').filter(Boolean);
      slugs.forEach((slug) => {
        const cat = categories.find((c) => c.slug === slug);
        const name = cat
          ? locale === 'en' && cat.nameEn
            ? cat.nameEn
            : cat.name
          : slug;
        items.push({
          key: `genre-${slug}`,
          label: name,
          clear: () => {
            const updated = slugs.filter((s) => s !== slug);
            setFilters({ genre: updated.length > 0 ? updated.join(',') : undefined });
          },
        });
      });
    }

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      items.push({
        key: 'minPrice',
        label: `Min ${formatPrice(filters.minPrice, locale)}`,
        clear: () => setFilters({ minPrice: undefined }),
      });
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      items.push({
        key: 'maxPrice',
        label: `Max ${formatPrice(filters.maxPrice, locale)}`,
        clear: () => setFilters({ maxPrice: undefined }),
      });
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      items.push({
        key: 'minRating',
        label: `${filters.minRating}+ \u2605`,
        clear: () => setFilters({ minRating: undefined }),
      });
    }

    if (pageParams.search) {
      items.push({
        key: 'search',
        label: `"${pageParams.search}"`,
        clear: () => {
          setSearchInput('');
          setPage('catalog', { ...pageParams, search: '' });
        },
      });
    }

    return items;
  }, [filters, categories, locale, pageParams, setFilters, setPage]);

  // Breadcrumb: if single genre filtered, show the category name
  const genreCategory = useMemo(() => {
    if (!filters.genre) return null;
    const slugs = filters.genre.split(',').filter(Boolean);
    if (slugs.length === 1) {
      return categories.find((c) => c.slug === slugs[0]) || null;
    }
    return null;
  }, [filters.genre, categories]);

  const hasActiveFilters = activeFilters.length > 0;

  const filterSidebar = (
    <FilterSidebar
      categories={categories}
      filters={filters}
      onFilterChange={handleFilterChange}
      onReset={handleReset}
      locale={locale}
    />
  );

  // Pagination range
  const paginationRange = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Wave delay for grid items
  const getWaveDelay = (index: number) => {
    const cols = viewMode === 'grid' ? 4 : 1;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return (row * 0.06) + (col * 0.04);
  };

  return (
    <section className="relative min-h-screen bg-background">
      {/* Subtle gold gradient overlay at top */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage('home');
                  }}
                >
                  {t('nav.home', locale)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {genreCategory ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleReset();
                      }}
                    >
                      {t('nav.catalog', locale)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {locale === 'en' && genreCategory.nameEn
                        ? genreCategory.nameEn
                        : genreCategory.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {t('catalog.title', locale)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-6 relative"
        >
          {/* Gold gradient accent behind title */}
          <div className="absolute -left-2 -top-2 -right-2 -bottom-1 bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent rounded-lg -z-10 blur-sm" aria-hidden="true" />
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gradient-gold">
            {genreCategory
              ? locale === 'en' && genreCategory.nameEn
                ? genreCategory.nameEn
                : genreCategory.name
              : t('catalog.title', locale)}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {!loading && (
              <>
                <p className="text-sm text-muted-foreground">
                  {total} {t('catalog.results', locale)}
                </p>
                {/* Gold results count badge */}
                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-xs font-medium px-2 py-0.5 shadow-sm shadow-[#D4AF37]/5">
                  {total}
                </Badge>
              </>
            )}
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('nav.search', locale)}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10 bg-background border-border focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20"
            />
          </form>

          {/* Sort Bar with gold underline indicator (Desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-sm text-muted-foreground whitespace-nowrap mr-1">
              {t('catalog.sort', locale)}:
            </span>
            <div className="relative flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFilterChange({ sort: opt.value })}
                  className="relative px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 rounded-md whitespace-nowrap"
                >
                  {filters.sort === opt.value && (
                    <motion.div
                      layoutId="sort-indicator"
                      className="absolute inset-0 bg-[#D4AF37] text-white rounded-md shadow-sm shadow-[#D4AF37]/25"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      filters.sort === opt.value
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(opt.labelKey, locale)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`relative p-1.5 rounded-md transition-colors duration-200 ${
                viewMode === 'grid' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Grid view"
            >
              {viewMode === 'grid' && (
                <motion.div
                  layoutId="view-mode-indicator"
                  className="absolute inset-0 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <LayoutGrid className="relative z-10 h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`relative p-1.5 rounded-md transition-colors duration-200 ${
                viewMode === 'list' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List view"
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="view-mode-indicator"
                  className="absolute inset-0 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <List className="relative z-10 h-4 w-4" />
            </button>
          </div>

          {/* Mobile Filter Button + View Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile View Toggle */}
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`relative p-1.5 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' ? 'text-[#D4AF37]' : 'text-muted-foreground'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`relative p-1.5 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' ? 'text-[#D4AF37]' : 'text-muted-foreground'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 border-border gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{t('catalog.filter', locale)}</span>
                  {hasActiveFilters && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-[#D4AF37] text-white border-0 text-[10px] rounded-full shadow-sm shadow-[#D4AF37]/30">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              {/* Enhanced Mobile Filter Sheet */}
              <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl glass backdrop-blur-xl bg-background/95 border-t-2 border-[#D4AF37]/30 transition-all duration-300 ease-in-out">
                <SheetHeader className="pb-3 border-b border-[#D4AF37]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center">
                      <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <SheetTitle className="font-heading text-lg text-foreground">
                        {t('catalog.filter', locale)}
                      </SheetTitle>
                      <SheetDescription className="text-xs text-muted-foreground">
                        {locale === 'id'
                          ? 'Sesuaikan pencarian kamu'
                          : 'Refine your search'}
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1 px-4 py-4">
                  {filterSidebar}
                </ScrollArea>
                <div className="p-4 pt-2 border-t border-[#D4AF37]/10">
                  <Button
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C49B2E] text-white hover:from-[#C49B2E] hover:to-[#B8960C] shadow-lg shadow-[#D4AF37]/20 font-medium rounded-xl h-11"
                    onClick={() => setSheetOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {locale === 'id' ? 'Terapkan Filter' : 'Apply Filters'}
                  </Button>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { handleReset(); }}
                      className="w-full mt-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors py-1"
                    >
                      {t('catalog.filter.reset', locale)}
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Animated Filter Tags (quick genre filters) */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4 hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
        >
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            {locale === 'id' ? 'Populer:' : 'Trending:'}
          </span>
          {categories.slice(0, 6).map((cat) => {
            const isActive = filters.genre === cat.slug;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isActive) {
                    handleFilterChange({ genre: undefined });
                  } else {
                    handleFilterChange({ genre: cat.slug });
                  }
                }}
                className={`filter-tag shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-sm shadow-[#D4AF37]/20'
                    : 'border-border text-muted-foreground hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
                }`}
              >
                {locale === 'en' && cat.nameEn ? cat.nameEn : cat.name}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active Filter Badges */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <Filter className="h-3 w-3 inline mr-1" />
                  {locale === 'id' ? 'Filter aktif:' : 'Active filters:'}
                </span>
                {activeFilters.map((filter) => (
                  <motion.div
                    key={filter.key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1.5 pr-1 py-1 text-xs bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 cursor-default"
                    >
                      <span>{filter.label}</span>
                      <button
                        onClick={filter.clear}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-[#D4AF37]/20 transition-colors"
                        aria-label={`Remove ${filter.label} filter`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {t('catalog.filter.reset', locale)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="hidden lg:block w-[240px] shrink-0 glass-card backdrop-blur-sm border border-[#D4AF37]/10"
          >
            <div className="sticky top-24">
              {categoriesLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ) : (
                filterSidebar
              )}
            </div>
          </motion.aside>

          {/* Book Grid/List + Pagination */}
          <div className="flex-1 min-w-0">
            {loading ? (
              viewMode === 'list' ? <BookListSkeleton /> : <BookGridSkeleton />
            ) : books.length === 0 ? (
              <EmptyState locale={locale} onReset={handleReset} />
            ) : (
              <>
                {/* Books: Grid or List */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                        {books.map((book, index) => (
                          <motion.div
                            key={book.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, delay: getWaveDelay(index), ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="rounded-xl book-card-glow transition-shadow duration-300"
                          >
                            <BookCard book={book} index={index} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {books.map((book, index) => (
                          <BookListItem key={book.id} book={book} index={index} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.nav
                    key={`pagination-${currentPage}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    aria-label="Pagination"
                  >
                    {/* Page numbers */}
                    <div className="flex items-center gap-1.5">
                      {/* Prev */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-border hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 disabled:opacity-40 transition-all duration-200"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        aria-label={t('general.previous', locale)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      {paginationRange.map((item, idx) =>
                        item === '...' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={currentPage === item ? 'default' : 'outline'}
                            size="icon"
                            className={`h-9 w-9 transition-all duration-300 ${
                              currentPage === item
                                ? 'bg-gradient-to-b from-[#D4AF37] to-[#B8960C] text-white hover:from-[#C49B2E] hover:to-[#A6850A] border-[#D4AF37] shadow-md shadow-[#D4AF37]/30 scale-105'
                                : 'border-border text-foreground hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'
                            }`}
                            onClick={() => setCurrentPage(item as number)}
                            aria-label={`Page ${item}`}
                            aria-current={
                              currentPage === item ? 'page' : undefined
                            }
                          >
                            {item}
                          </Button>
                        )
                      )}

                      {/* Next */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-border hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 disabled:opacity-40 transition-all duration-200"
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        aria-label={t('general.next', locale)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Page Jump Input */}
                    {totalPages > 5 && (
                      <form
                        onSubmit={handlePageJump}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span>{locale === 'id' ? 'Ke halaman' : 'Go to page'}</span>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={pageJumpInput}
                          onChange={(e) => setPageJumpInput(e.target.value)}
                          placeholder={String(currentPage)}
                          className="h-8 w-14 text-center text-sm border-border focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20"
                        />
                        <span className="text-muted-foreground/60">
                          {locale === 'id' ? `dari ${totalPages}` : `of ${totalPages}`}
                        </span>
                      </form>
                    )}
                  </motion.nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
