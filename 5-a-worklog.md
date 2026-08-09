# Task 5-a: WishlistPage Implementation

## Summary of Changes

### Files Modified (4) + Files Created (1)

---

### 1. **Created: `/src/components/pages/WishlistPage.tsx`** (new file)
A full-featured wishlist page component with:
- **`'use client'` directive** for client-side rendering
- **Book fetching**: Fetches all books from `/api/books` and filters by wishlist IDs, preserving wishlist order
- **Beautiful empty state**: Animated decorative circles, Heart icon, descriptive text, and an "Explore Catalog" CTA button
- **Grid of BookCards**: Responsive grid (2/3/4/5 cols at breakpoints) with `AnimatePresence` for smooth add/remove animations
- **Remove-from-wishlist button**: Each card has an `X` button overlaid at the top-right corner with hover effects (white → red)
- **Book count badge**: Gold-themed pill showing `{count} novels saved`
- **Clear All button**: Opens a confirmation `Dialog` (shadcn/ui) before clearing the entire wishlist
- **Breadcrumbs**: Home → Wishlist navigation using shadcn/ui `Breadcrumb` component
- **Header**: Gold gradient icon box with Heart + title + subtitle
- **Loading state**: Skeleton placeholders while fetching
- **Graceful degradation**: Shows message if some wishlist items are not found in the catalog
- **Full i18n support**: All strings use `t()` function with `locale`
- **Styling patterns**: `#D4AF37` gold theme, `font-heading`, shadcn/ui components, framer-motion animations

### 2. **Modified: `/src/lib/store.ts`**
- Added `'wishlist'` to the `Page` union type (line 19)

### 3. **Modified: `/src/lib/i18n.ts`**
- Added 10 new translation keys for both `id` and `en` locales:
  - `wishlist.title`, `wishlist.subtitle`, `wishlist.empty`, `wishlist.emptyDesc`
  - `wishlist.exploreCatalog`, `wishlist.bookCount`, `wishlist.removeFromWishlist`
  - `wishlist.removed`, `wishlist.clearAll`, `wishlist.clearConfirm`

### 4. **Modified: `/src/components/MainApp.tsx`**
- Added `import WishlistPage from '@/components/pages/WishlistPage'`
- Added `case 'wishlist': return <WishlistPage />;` to the page routing switch

### 5. **Modified: `/src/components/layout/Header.tsx`**
- Changed the wishlist button's `onClick` from `handleNavClick('dashboard', { tab: 'wishlist' })` to `handleNavClick('wishlist')` so it now navigates directly to the dedicated WishlistPage

---

## Verification
- `bun run lint` passes cleanly (zero errors, zero warnings)
- Dev server compiles without errors
- All patterns match existing codebase conventions
