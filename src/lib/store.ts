import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from './i18n';
import type { ReadingList } from '@/types';

export type Page =
  | 'home'
  | 'catalog'
  | 'book-detail'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'admin'
  | 'faq'
  | 'blog'
  | 'blog-detail'
  | 'categories'
  | 'wishlist'
  | 'order-success'
  | 'order-tracking'
  | 'compare'
  | 'reading-lists'
  | 'loyalty'
  | 'vouchers';

export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  coverImage: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  format: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  role: string;
  points: number;
}

interface AppState {
  // Navigation
  page: Page;
  pageParams: Record<string, string>;
  setPage: (page: Page, params?: Record<string, string>) => void;
  prevPage: Page;
  setPrevPage: (page: Page) => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;

  // Comparison
  comparison: string[];
  toggleComparison: (bookId: string) => void;
  clearComparison: () => void;
  isInComparison: (bookId: string) => boolean;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filters
  filters: {
    genre?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    year?: number;
    sort: string;
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;

  // Notification
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Search open
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (bookId: string) => void;

  // Reading Lists
  readingLists: ReadingList[];
  createReadingList: (name: string) => void;
  deleteReadingList: (id: string) => void;
  renameReadingList: (id: string, name: string) => void;
  addBookToReadingList: (listId: string, bookId: string) => void;
  removeBookFromReadingList: (listId: string, bookId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      page: 'home',
      pageParams: {},
      setPage: (page, params = {}) => {
        const state = get();
        set({ prevPage: state.page, page, pageParams: params });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      prevPage: 'home',
      setPrevPage: (page) => set({ prevPage: page }),

      // Locale
      locale: 'id',
      setLocale: (locale) => set({ locale }),

      // Auth
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((c) => c.id !== id) });
      },
      updateCartQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((c) => (c.id === id ? { ...c, quantity } : c)),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },
      cartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Wishlist
      wishlist: [],
      toggleWishlist: (bookId) => {
        const { wishlist } = get();
        if (wishlist.includes(bookId)) {
          set({ wishlist: wishlist.filter((id) => id !== bookId) });
        } else {
          set({ wishlist: [...wishlist, bookId] });
        }
      },
      isInWishlist: (bookId) => {
        return get().wishlist.includes(bookId);
      },

      // Comparison
      comparison: [],
      toggleComparison: (bookId) => {
        const { comparison } = get();
        if (comparison.includes(bookId)) {
          set({ comparison: comparison.filter((id) => id !== bookId) });
        } else {
          if (comparison.length >= 3) {
            get().showNotification(
              get().locale === 'id'
                ? 'Maksimal 3 buku untuk dibandingkan'
                : 'Maximum 3 books for comparison',
              'info'
            );
            return;
          }
          set({ comparison: [...comparison, bookId] });
        }
      },
      clearComparison: () => set({ comparison: [] }),
      isInComparison: (bookId) => {
        return get().comparison.includes(bookId);
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Filters
      filters: { sort: 'newest' },
      setFilters: (newFilters) => {
        set({ filters: { ...get().filters, ...newFilters } });
      },
      resetFilters: () => set({ filters: { sort: 'newest' } }),

      // Notification
      notification: null,
      showNotification: (message, type) => {
        set({ notification: { message, type } });
        setTimeout(() => set({ notification: null }), 3000);
      },

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      // Search open
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // Recently Viewed
      recentlyViewed: [],
      addRecentlyViewed: (bookId) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter((id) => id !== bookId);
        const updated = [bookId, ...filtered].slice(0, 10);
        set({ recentlyViewed: updated });
      },

      // Reading Lists
      readingLists: [],
      createReadingList: (name) => {
        const newList: ReadingList = {
          id: crypto.randomUUID(),
          name: name.trim(),
          bookIds: [],
          createdAt: new Date().toISOString(),
        };
        set({ readingLists: [...get().readingLists, newList] });
      },
      deleteReadingList: (id) => {
        set({ readingLists: get().readingLists.filter((l) => l.id !== id) });
      },
      renameReadingList: (id, name) => {
        set({
          readingLists: get().readingLists.map((l) =>
            l.id === id ? { ...l, name: name.trim() } : l
          ),
        });
      },
      addBookToReadingList: (listId, bookId) => {
        const { readingLists } = get();
        const list = readingLists.find((l) => l.id === listId);
        if (list && !list.bookIds.includes(bookId)) {
          set({
            readingLists: readingLists.map((l) =>
              l.id === listId
                ? { ...l, bookIds: [...l.bookIds, bookId] }
                : l
            ),
          });
        }
      },
      removeBookFromReadingList: (listId, bookId) => {
        set({
          readingLists: get().readingLists.map((l) =>
            l.id === listId
              ? { ...l, bookIds: l.bookIds.filter((id) => id !== bookId) }
              : l
          ),
        });
      },
    }),
    {
      name: 'noveluxe-store',
      partialize: (state) => ({
        locale: state.locale,
        cart: state.cart,
        wishlist: state.wishlist,
        comparison: state.comparison,
        readingLists: state.readingLists,
        recentlyViewed: state.recentlyViewed,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function formatPrice(price: number, locale: Locale = 'id'): string {
  // Prices in DB are stored as "thousands" (e.g. 79.99 = Rp79,990)
  const actualPrice = Math.round(price * 1000);
  if (locale === 'id') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(actualPrice);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(actualPrice);
}
