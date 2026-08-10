'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShoppingCart, Search, Menu, X, BookOpen, Heart, User, Globe, LogIn, LayoutDashboard, LogOut, TrendingUp, Clock, Star, SearchX, Loader2, ArrowRight, LayoutGrid, GitCompare, Library, Award } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

const navItems = [
  { labelKey: 'nav.home', page: 'home' as const },
  { labelKey: 'nav.catalog', page: 'catalog' as const },
  { labelKey: 'nav.categories', page: 'categories' as const },
  { labelKey: 'nav.promo', page: 'vouchers' as const },
  { labelKey: 'nav.blog', page: 'blog' as const },
  { labelKey: 'nav.faq', page: 'faq' as const },
];

const SEARCH_HISTORY_KEY = 'noveluxe-search-history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function addSearchHistory(query: string) {
  if (!query.trim()) return;
  try {
    let history = getSearchHistory().filter((h) => h !== query.trim());
    history.unshift(query.trim());
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

function removeSearchHistoryItem(term: string) {
  try {
    const history = getSearchHistory().filter((h) => h !== term);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

function clearSearchHistory() {
  try { localStorage.removeItem(SEARCH_HISTORY_KEY); } catch { /* ignore */ }
}

/** Highlight matching portions of text in gold */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <span className="text-[#D4AF37] font-semibold">{match}</span>
      {after}
    </>
  );
}

/** Small star rating display */
function StarRating({ rating }: { rating: number }) {
  if (!rating || rating <= 0) return null;
  return (
    <div className="flex items-center gap-0.5">
      <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
      <span className="text-[11px] font-medium text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/** Category badge */
function CategoryBadge({ category, locale }: { category?: { name: string; slug: string } | null; locale: Locale }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-medium text-[#D4AF37] border border-[#D4AF37]/20">
      {locale === 'en' && category.slug ? category.slug.charAt(0).toUpperCase() + category.slug.slice(1) : category.name}
    </span>
  );
}

/** Book result row for search and trending */
function BookResultItem({
  book,
  locale,
  isActive,
  onClick,
}: {
  book: any;
  locale: Locale;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all duration-150 group border-l-2 ${isActive ? 'bg-[#D4AF37]/10 border-l-[#D4AF37]' : 'border-l-transparent hover:bg-[#D4AF37]/5 hover:border-l-[#D4AF37]/40'}`}
    >
      {/* Cover thumbnail */}
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-12 w-12 rounded-lg object-cover shrink-0 bg-muted"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
          <BookOpen className="h-5 w-5 text-muted-foreground/50" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate leading-tight">
          <HighlightText text={book.title || ''} query={book._searchQuery || ''} />
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          <HighlightText text={book.author || ''} query={book._searchQuery || ''} />
        </p>
        <div className="flex items-center gap-2 mt-1">
          <CategoryBadge category={book.category} locale={locale} />
          <StarRating rating={book.rating} />
        </div>
      </div>

      {/* Price */}
      {(book.discountPrice || book.price) ? (
        <span className="text-sm font-bold text-[#D4AF37] shrink-0">
          {formatPrice(book.discountPrice || book.price, locale)}
        </span>
      ) : null}
    </button>
  );
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { page, locale, setLocale, user, isAuthenticated, setUser, setPage, wishlist, comparison, searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useAppStore();

  // Fetch trending books on first open
  useEffect(() => {
    if (searchOpen && trendingBooks.length === 0) {
      fetch('/api/books/trending')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setTrendingBooks(data.slice(0, 5));
        })
        .catch(() => {});
    }
  }, [searchOpen, trendingBooks.length]);

  // Compute which section to show
  const searchHistory = getSearchHistory();
  const hasQuery = searchQuery.trim().length > 0;
  const showTrending = searchOpen && !hasQuery && searchHistory.length === 0;
  const showHistory = searchOpen && !hasQuery && searchHistory.length > 0;
  const showResults = hasQuery && searchResults.length > 0 && !isSearching;
  const showNoResults = hasQuery && !isSearching && searchResults.length === 0;
  const showLoading = hasQuery && isSearching;

  // Total navigable items for keyboard
  const totalItems_kb = showResults
    ? searchResults.length
    : showHistory
      ? searchHistory.length
      : showTrending
        ? trendingBooks.length
        : 0;

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setHighlightedIdx(-1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        const books = (data.books || []).map((b: any) => ({ ...b, _searchQuery: query }));
        setSearchResults(books);
      } catch { setSearchResults([]); }
      setIsSearching(false);
    }, 300);
  }, [setSearchQuery]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchResults([]);
    setSearchQuery('');
    setHighlightedIdx(-1);
    setIsSearching(false);
  }, [setSearchOpen, setSearchQuery]);

  const handleSelectResult = useCallback((query?: string) => {
    const q = query || searchQuery;
    if (q.trim()) addSearchHistory(q);
    setPage('catalog', { search: q.trim() });
    closeSearch();
  }, [searchQuery, setPage, closeSearch]);

  const handleGoToBook = useCallback((book: any) => {
    if (book.slug) {
      if (searchQuery.trim()) addSearchHistory(searchQuery);
      setPage('book-detail', { slug: book.slug });
      closeSearch();
    }
  }, [searchQuery, setPage, closeSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.min(prev + 1, totalItems_kb - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx < totalItems_kb) {
        if (showResults && searchResults[highlightedIdx]) {
          handleGoToBook(searchResults[highlightedIdx]);
        } else if (showHistory && searchHistory[highlightedIdx]) {
          const term = searchHistory[highlightedIdx];
          setSearchQuery(term);
          handleSearch(term);
        } else if (showTrending && trendingBooks[highlightedIdx]) {
          handleGoToBook(trendingBooks[highlightedIdx]);
        }
      } else if (searchQuery.trim()) {
        handleSelectResult();
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const handleNavClick = (p: typeof page, params?: Record<string, string>) => {
    setIsMobileMenuOpen(false);
    closeSearch();
    setPage(p, params);
  };

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  const handleLogout = () => {
    setUser(null);
    setIsUserMenuOpen(false);
    setPage('home');
  };

  const handleRemoveHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSearchHistoryItem(term);
    setHistoryKey((k) => k + 1);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistoryKey((k) => k + 1);
  };

  const handleHistoryClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  const darkMode = theme === 'dark';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? (darkMode ? 'bg-[#0A0A0A]/90' : 'bg-white/90') + ' backdrop-blur-[30px] border-b border-border shadow-sm' : 'bg-transparent'}`}>
      {isScrolled && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2.5 group" aria-label="Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37] text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#D4AF37]/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight md:text-2xl transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Novel<span className="text-[#D4AF37]">uxe</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <button key={item.labelKey} onClick={() => handleNavClick(item.page, item.params)} className={`relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md ${page === item.page ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-foreground'} hover:text-[#D4AF37]`}>
                {t(item.labelKey, locale)}
                {page === item.page && (
                  <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <div className="relative" ref={dropdownRef}>
              <Button variant="ghost" size="icon" onClick={() => { if (searchOpen) { closeSearch(); } else { setSearchOpen(true); } }} className={`h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${searchOpen ? 'text-[#D4AF37]' : ''}`} aria-label="Search">
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-12 w-[360px] sm:w-[420px]"
                  >
                    <div className="rounded-xl border border-border bg-background shadow-2xl shadow-black/10 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={searchRef}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('nav.search', locale)}
                            className="h-10 pl-9 pr-3 border-0 bg-secondary/50 focus-visible:ring-0 focus-visible:ring-offset-0 [&]:focus-within:ring-1 [&]:focus-within:ring-[#D4AF37]/50 rounded-lg"
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4AF37] animate-spin" />
                          )}
                        </div>
                      </div>

                      {/* Dropdown content */}
                      <div className="max-h-[380px] overflow-y-auto scrollbar-thin">

                        {/* Search History - shown when no active query and history exists */}
                        {showHistory && (
                          <div className="px-3 pb-2" key={`hist-${historyKey}`}>
                            <div className="flex items-center justify-between mb-2 px-1">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {t('search.recent', locale)}
                                </span>
                              </div>
                              <button
                                onClick={handleClearHistory}
                                className="text-[11px] font-medium text-muted-foreground hover:text-[#D4AF37] transition-colors"
                              >
                                {t('search.clearAll', locale)}
                              </button>
                            </div>
                            <div className="space-y-0.5">
                              {searchHistory.map((term, idx) => (
                                <div
                                  key={term}
                                  onClick={() => handleHistoryClick(term)}
                                  className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-sm text-left transition-all duration-150 cursor-pointer border-l-2 ${highlightedIdx === idx ? 'bg-[#D4AF37]/10 border-l-[#D4AF37]' : 'border-l-transparent hover:bg-[#D4AF37]/5 hover:border-l-[#D4AF37]/40'}`}
                                >
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                  <span className="flex-1 truncate text-sm">{term}</span>
                                  <button
                                    onClick={(e) => handleRemoveHistoryItem(term, e)}
                                    className="p-0.5 rounded-md hover:bg-muted transition-colors shrink-0"
                                    aria-label="Remove"
                                  >
                                    <X className="h-3 w-3 text-muted-foreground/60 hover:text-foreground" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending Books - shown when no query and no history */}
                        {showTrending && (
                          <div className="px-1 pb-2">
                            <div className="flex items-center gap-1.5 mb-1 px-2 pt-1">
                              <TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" />
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('search.trending', locale)}
                              </span>
                            </div>
                            <div>
                              {trendingBooks.map((book, idx) => (
                                <BookResultItem
                                  key={book.id}
                                  book={book}
                                  locale={locale}
                                  isActive={highlightedIdx === idx}
                                  onClick={() => handleGoToBook(book)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Search Results */}
                        {showResults && (
                          <div className="border-t border-border">
                            {/* Results for header */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30">
                              <LayoutGrid className="h-3.5 w-3.5 text-[#D4AF37]" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {t('search.resultsFor', locale)} &ldquo;<span className="text-foreground font-semibold">{searchQuery}</span>&rdquo;
                              </span>
                            </div>
                            <div>
                              {searchResults.map((book: any, idx: number) => (
                                <BookResultItem
                                  key={book.id}
                                  book={book}
                                  locale={locale}
                                  isActive={highlightedIdx === idx}
                                  onClick={() => handleGoToBook(book)}
                                />
                              ))}
                            </div>
                            {/* View all results link */}
                            <button
                              onClick={() => handleSelectResult()}
                              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors border-t border-border"
                            >
                              {t('search.viewAll', locale)}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Loading state */}
                        {showLoading && (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Loader2 className="h-5 w-5 text-[#D4AF37] animate-spin" />
                            <span className="text-xs text-muted-foreground">{t('search.searching', locale)}</span>
                          </div>
                        )}

                        {/* Empty state */}
                        {showNoResults && (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <SearchX className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-semibold text-foreground mb-1">{t('search.noResults', locale)}</p>
                            <p className="text-xs text-muted-foreground max-w-[240px]">{t('search.noResultsDesc', locale)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Locale Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleLocale} className="h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Toggle language">
              <Globe className="h-4 w-4" />
            </Button>

            {theme && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" onClick={() => handleNavClick('wishlist')} className="relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-white">{wishlist.length}</span>}
            </Button>

            {/* Compare */}
            <Button variant="ghost" size="icon" onClick={() => handleNavClick('compare')} className="relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Compare">
              <GitCompare className="h-4 w-4" />
              {comparison.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[9px] font-bold text-white">{comparison.length}</span>}
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" onClick={openCart} className="relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Cart">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-white border-0">{totalItems}</Badge>}
            </Button>

            {/* User Menu */}
            {theme && (
              <div className="relative" ref={userMenuRef}>
                <Button variant="ghost" size="icon" onClick={() => isAuthenticated ? setIsUserMenuOpen(!isUserMenuOpen) : setPage('login')} className="h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Account">
                  <User className="h-4 w-4" />
                </Button>
                <AnimatePresence>
                  {isUserMenuOpen && isAuthenticated && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        {user?.points ? <p className="text-xs text-[#D4AF37] mt-1">{t('points.label', locale)}: {user.points}</p> : null}
                      </div>
                      <div className="p-1.5">
                        <button onClick={() => { setPage('dashboard'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"><User className="h-4 w-4" />{t('nav.profile', locale)}</button>
                        <button onClick={() => { setPage('dashboard', { tab: 'orders' }); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"><ShoppingCart className="h-4 w-4" />{t('nav.orders', locale)}</button>
                        <button onClick={() => { setPage('reading-lists'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"><Library className="h-4 w-4" />{t('readingLists.title', locale)}</button>
                        <button onClick={() => { setPage('loyalty'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"><Award className="h-4 w-4" />{t('nav.loyalty', locale)}</button>
                        {user?.role === 'admin' && (
                          <button onClick={() => { setPage('admin'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"><LayoutDashboard className="h-4 w-4" />{t('nav.admin', locale)}</button>
                        )}
                        <div className="my-1 border-t border-border" />
                        <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"><LogOut className="h-4 w-4" />{t('nav.logout', locale)}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden h-9 w-9" aria-label="Menu">
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col gap-0.5 p-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {navItems.map((item) => (
                <button key={item.labelKey} onClick={() => handleNavClick(item.page, item.params)} className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${page === item.page ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                  {t(item.labelKey, locale)}
                </button>
              ))}
              <div className="my-2 border-t border-border" />
              {isAuthenticated ? (
                <>
                  <button onClick={() => { setPage('dashboard'); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">{t('nav.profile', locale)}</button>
                  <button onClick={() => { setPage('reading-lists'); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"><Library className="h-4 w-4" />{t('readingLists.title', locale)}</button>
                  <button onClick={() => { setPage('loyalty'); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"><Award className="h-4 w-4" />{t('nav.loyalty', locale)}</button>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">{t('nav.logout', locale)}</button>
                </>
              ) : (
                <button onClick={() => { setPage('login'); setIsMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"><LogIn className="h-4 w-4" />{t('nav.login', locale)}</button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
