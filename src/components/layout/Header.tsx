'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShoppingCart, Search, Menu, X, BookOpen, Heart, User, Globe, LogIn, LayoutDashboard, LogOut, TrendingUp, Clock, ArrowUp } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore, formatPrice } from '@/lib/store';
import { t } from '@/lib/i18n';

const TRENDING_SEARCHES = [
  { id: 'Laut Bercerita', key: 'laut bercerita' },
  { id: 'Filosofi Teras', key: 'filosofi teras' },
  { id: 'Bumi Manusia', key: 'bumi manusia' },
  { id: 'Pulang', key: 'pulang' },
  { id: 'Laskar Pelangi', key: 'laskar pelangi' },
];

const navItems = [
  { labelKey: 'nav.home', page: 'home' as const },
  { labelKey: 'nav.catalog', page: 'catalog' as const },
  { labelKey: 'nav.categories', page: 'categories' as const },
  { labelKey: 'nav.promo', page: 'catalog' as const, params: { promo: 'true' } },
  { labelKey: 'nav.blog', page: 'blog' as const },
  { labelKey: 'nav.faq', page: 'faq' as const },
];

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('noveluxe-search-history') || '[]'); }
  catch { return []; }
}

function addSearchHistory(query: string) {
  if (!query.trim()) return;
  try {
    let history = getSearchHistory().filter((h) => h !== query.trim());
    history.unshift(query.trim());
    history = history.slice(0, 8);
    localStorage.setItem('noveluxe-search-history', JSON.stringify(history));
  } catch { /* ignore */ }
}

function clearSearchHistory() {
  try { localStorage.removeItem('noveluxe-search-history'); } catch { /* ignore */ }
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { page, locale, setLocale, user, isAuthenticated, setUser, setPage, wishlist, searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useAppStore();

  const searchHistory = getSearchHistory();
  const showTrending = searchOpen && !searchQuery.trim() && searchHistory.length === 0;
  const showHistory = searchOpen && !searchQuery.trim() && searchHistory.length > 0;
  const combinedItems = searchQuery.trim() ? searchResults : [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setHighlightedIdx(-1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.books || []);
      } catch { setSearchResults([]); }
      setIsSearching(false);
    }, 300);
  }, [setSearchQuery]);

  const handleSelectResult = useCallback((query?: string) => {
    const q = query || searchQuery;
    if (q.trim()) addSearchHistory(q);
    setPage('catalog', { search: q.trim() });
    setSearchOpen(false);
    setSearchResults([]);
    setSearchQuery('');
  }, [searchQuery, setPage, setSearchOpen, setSearchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = combinedItems.length > 0
      ? combinedItems
      : (searchQuery.trim() ? [] : (searchHistory.length > 0 ? searchHistory : TRENDING_SEARCHES.map(s => s.key)));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx < items.length) {
        handleSelectResult(items[highlightedIdx]);
      } else if (searchQuery.trim()) {
        handleSelectResult();
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchResults([]);
      setHighlightedIdx(-1);
    }
  }, [combinedItems, searchHistory, searchQuery, highlightedIdx, handleSelectResult, setSearchOpen, setSearchQuery]);

  const handleNavClick = (p: typeof page, params?: Record<string, string>) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchOpen(false);
    setSearchResults([]);
    setHighlightedIdx(-1);
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
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setSearchResults([]); setSearchQuery(''); setHighlightedIdx(-1); } }} className={`h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${searchOpen ? 'text-[#D4AF37]' : ''}`} aria-label="Search">
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-12 w-80 sm:w-96">
                    <div className="rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden">
                      <div className="p-2">
                        <Input ref={searchRef} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('nav.search', locale)} className="h-10 border-0 focus-visible:ring-0 bg-secondary/50" />
                      </div>

                      <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {/* Trending Searches */}
                        {showTrending && (
                          <div className="px-3 pb-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              <TrendingUp className="h-3.5 w-3.5 text-[#D4AF37]" />
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {locale === 'id' ? 'Trending' : 'Trending'}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {TRENDING_SEARCHES.map((s, idx) => (
                                <button
                                  key={s.id}
                                  onClick={() => { setSearchQuery(s.key); handleSearch(s.key); }}
                                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${highlightedIdx === idx ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-foreground hover:bg-secondary/50'}`}
                                >
                                  <span className="text-xs text-muted-foreground w-4 text-right">{idx + 1}</span>
                                  <span>{s.id}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Search History */}
                        {showHistory && (
                          <div className="px-3 pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  {locale === 'id' ? 'Terakhir dicari' : 'Recent'}
                                </span>
                              </div>
                              <button
                                onClick={() => { clearSearchHistory(); }}
                                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {locale === 'id' ? 'Hapus' : 'Clear'}
                              </button>
                            </div>
                            <div className="space-y-0.5">
                              {searchHistory.map((term, idx) => (
                                <button
                                  key={term}
                                  onClick={() => { setSearchQuery(term); handleSearch(term); }}
                                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${highlightedIdx === idx ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-foreground hover:bg-secondary/50'}`}
                                >
                                  <Clock className="h-3 w-3 text-muted-foreground/50" />
                                  <span className="flex-1 truncate">{term}</span>
                                  <ArrowUp className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                                </button>
                              ))}
                              </div>
                            </div>
                        )}

                        {/* Search Results */}
                        {combinedItems.length > 0 && (
                          <div className="border-t border-border">
                            {combinedItems.map((book: any, idx: number) => (
                              <button
                                key={book.id || book}
                                onClick={() => { if (book.slug) { setPage('book-detail', { slug: book.slug }); setSearchOpen(false); setSearchResults([]); setSearchQuery(''); addSearchHistory(book.title || book); } else { handleSelectResult(typeof book === 'string' ? book : book.title); } }}
                                className={`flex items-center gap-3 w-full p-3 transition-colors text-left ${highlightedIdx === idx ? 'bg-[#D4AF37]/10' : 'hover:bg-secondary/50'}`}
                              >
                                {book.coverImage ? (
                                  <img src={book.coverImage} alt={book.title} className="h-12 w-9 object-cover rounded" />
                                ) : (
                                  <div className="flex h-12 w-9 items-center justify-center rounded bg-muted">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{book.title || book}</p>
                                  {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
                                </div>
                                {book.discountPrice || book.price ? (
                                  <span className="text-sm font-semibold text-[#D4AF37] shrink-0">{formatPrice(book.discountPrice || book.price, locale)}</span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        )}
                        {isSearching && <div className="p-4 text-center text-sm text-muted-foreground">{t('general.loading', locale)}</div>}
                        {searchQuery && !isSearching && searchResults.length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">{t('catalog.noResults', locale)}</div>
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
