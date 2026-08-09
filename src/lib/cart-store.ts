import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (book: Book) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountSavings: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (book: Book) => {
        set((state) => {
          const existing = state.items.find((item) => item.book.id === book.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.book.id === book.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { book, quantity: 1 }] };
        });
      },

      removeItem: (bookId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.book.id !== bookId),
        }));
      },

      updateQuantity: (bookId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.book.id === bookId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.book.discountPrice ?? item.book.price;
          return total + price * item.quantity;
        }, 0);
      },

      getDiscountSavings: () => {
        return get().items.reduce((total, item) => {
          if (item.book.discountPrice) {
            return total + (item.book.price - item.book.discountPrice) * item.quantity;
          }
          return total;
        }, 0);
      },
    }),
    {
      name: 'noveluxe-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
