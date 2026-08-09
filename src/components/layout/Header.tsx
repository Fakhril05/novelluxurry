'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShoppingCart, Search, Menu, X, BookOpen, Heart, User, Globe, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const navItems = [
  { labelKey: 'nav.home', page: 'home' as const },
  { labelKey: 'nav.catalog', page: 'catalog' as const },
  { labelKey: 'nav.categories', page: 'categories' as const },
  { labelKey: 'nav.promo', page: 'catalog' as const, params: { promo: 'true' } },
  { labelKey: 'nav.blog', page: 'blog' as const },
  { labelKey: 'nav.faq', page: 'faq' as const },
];

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const { page, locale, setLocale, user, isAuthenticated, setUser, setPage, wishlist, searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useAppStore();

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
  };

  const handleNavClick = (p: typeof page, params?: Record<string, string>) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchOpen(false);
    setSearchResults([]);
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? (darkMode ? 'bg-[#0A0A0A]/90' : 'bg-white/90') + ' backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-2.5 group" aria-label="Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37] text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#D4AF37]/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight md:text-2xl">
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
              <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setSearchResults([]); setSearchQuery(''); } }} className={`h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${searchOpen ? 'text-[#D4AF37]' : ''}`} aria-label="Search">
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 top-12 w-80 sm:w-96">
                    <div className="rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden">
                      <div className="p-2">
                        <Input ref={searchRef} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder={t('nav.search', locale)} className="h-10 border-0 focus-visible:ring-0 bg-secondary/50" onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); setSearchResults([]); } if (e.key === 'Enter' && searchQuery) { setPage('catalog', { search: searchQuery }); setSearchOpen(false); setSearchResults([]); } }} />
                      </div>
                      {searchResults.length > 0 && (
                        <div className="border-t border-border max-h-72 overflow-y-auto scrollbar-thin">
                          {searchResults.map((book: any) => (
                            <button key={book.id} onClick={() => { setPage('book-detail', { slug: book.slug }); setSearchOpen(false); setSearchResults([]); setSearchQuery(''); }} className="flex items-center gap-3 w-full p-3 hover:bg-secondary/50 transition-colors text-left">
                              <img src={book.coverImage} alt={book.title} className="h-12 w-9 object-cover rounded" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{book.title}</p>
                                <p className="text-xs text-muted-foreground">{book.author}</p>
                              </div>
                              <span className="text-sm font-semibold text-[#D4AF37] shrink-0">{(book.discountPrice || book.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {isSearching && <div className="p-4 text-center text-sm text-muted-foreground">{t('general.loading', locale)}</div>}
                      {searchQuery && !isSearching && searchResults.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">{t('catalog.noResults', locale)}</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            <Button variant="ghost" size="icon" onClick={() => handleNavClick('dashboard', { tab: 'wishlist' })} className="relative h-9 w-9 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]" aria-label="Wishlist">
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden">
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
