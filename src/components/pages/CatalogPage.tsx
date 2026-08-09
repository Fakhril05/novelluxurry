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
  BookOpen,
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
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground">
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
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium border border-[#D4AF37]/30 shadow-sm shadow-[#D4AF37]/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
              }`}
            >
              {t(opt.labelKey, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Genre */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground">
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
                  className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
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
      <div className="border-t border-border" />

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground">
          {t('catalog.filter.price', locale)}
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handlePriceSubmit()}
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
            className="h-9 text-sm"
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
      <div className="border-t border-border" />

      {/* Rating */}
      <div>
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3 text-foreground">
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
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {t('catalog.filter.reset', locale)}
        </Button>
      </div>
    </div>
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

function EmptyState({ locale }: { locale: 'id' | 'en' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
        {t('catalog.noResults', locale)}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {locale === 'id'
          ? 'Coba ubah filter atau kata kunci pencarian kamu'
          : 'Try adjusting your filters or search keywords'}
      </p>
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
          <p className="text-sm text-muted-foreground mt-1">
            {!loading && (
              <>
                {total} {t('catalog.results', locale)}
              </>
            )}
          </p>
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
              className="pl-10 h-10 bg-background border-border"
            />
          </form>

          {/* Sort Select (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('catalog.sort', locale)}:
            </span>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="appearance-none h-10 pl-3 pr-8 text-sm rounded-lg border border-[#D4AF37]/20 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 shadow-sm shadow-[#D4AF37]/5 hover:border-[#D4AF37]/40 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey, locale)}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="lg:hidden h-10 border-border gap-2"
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
            <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl glass backdrop-blur-xl bg-background/80 border-t border-[#D4AF37]/20 transition-all duration-300 ease-in-out">
              <SheetHeader className="pb-2">
                <SheetTitle className="font-heading text-lg">
                  {t('catalog.filter', locale)}
                </SheetTitle>
                <SheetDescription>
                  {locale === 'id'
                    ? 'Sesuaikan pencarian kamu'
                    : 'Refine your search'}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 px-4 pb-4">
                {filterSidebar}
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <Button
                  className="w-full bg-[#D4AF37] text-white hover:bg-[#B8960C]"
                  onClick={() => setSheetOpen(false)}
                >
                  {locale === 'id'
                    ? 'Tampilkan Hasil'
                    : 'Show Results'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
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
                  <Badge
                    key={filter.key}
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

          {/* Book Grid + Pagination */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <BookGridSkeleton />
            ) : books.length === 0 ? (
              <EmptyState locale={locale} />
            ) : (
              <>
                {/* Books Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  <AnimatePresence mode="popLayout">
                    {books.map((book, index) => (
                      <motion.div
                        key={book.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        whileHover={{ y: -4 }}
                        className="rounded-xl hover:card-glow transition-shadow duration-300"
                      >
                        <BookCard book={book} index={index} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.nav
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-10 flex items-center justify-center gap-1.5"
                    aria-label="Pagination"
                  >
                    {/* Prev */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-border disabled:opacity-40"
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
                          className={`h-9 w-9 transition-all duration-200 ${
                            currentPage === item
                              ? 'bg-[#D4AF37] text-white hover:bg-[#B8960C] border-[#D4AF37] shadow-md shadow-[#D4AF37]/30'
                              : 'border-border text-foreground hover:bg-muted hover:text-foreground hover:border-[#D4AF37]/30'
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
                      className="h-9 w-9 border-border disabled:opacity-40"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      aria-label={t('general.next', locale)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
