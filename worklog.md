# Noveluxe - Premium Novel Bookstore

## Current Project Status Assessment
- **Status**: RUNNING - Dev server on port 3000
- **Framework**: Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Architecture**: Single-page app via Zustand client routing on `/`
- **Database**: SQLite (Prisma ORM) with 20 books, 8 categories, 2 users, 4 testimonials, 6 blogs (with full i18n), 15 reviews, 3 vouchers
- **Overall Health**: Lint passes cleanly, all major bugs from prior rounds fixed, new features added

## Completed Modifications (Round 3 - QA + Features)

### Critical Bug Fixes
1. **B1: Price formatting completely wrong** — Prices stored in DB as "thousands" (e.g., 79.99 = Rp79,990) but `formatPrice()` displayed raw value (Rp80). Fixed by multiplying by 1000 before Intl.NumberFormat. Now shows "Rp79.990" correctly. Also fixed Header search results which used `toLocaleString()` directly instead of `formatPrice()`.
2. **B2: FAQ page all in English** — FAQ data in database only has English questions/answers. Added complete i18n mapping in FAQPage.tsx with Indonesian translations for all 6 FAQs. FAQ title also now properly localized ("Pertanyaan Umum" / "Frequently Asked Questions").

### Feature Enhancements
3. **Recently Viewed Books section on homepage** — Data was already tracked in localStorage (`noveluxe-recently-viewed`) by BookCard and BookDetailPage but never displayed. Added a new `Recently Viewed` section that appears between New Arrivals and Promo Banner when there are viewed books. Dispatches `CustomEvent('recently-viewed-updated')` for real-time updates.
4. **Blog page category filter** — Added category filter pills above the blog grid. Categories are dynamically extracted from blog data with i18n support. Selecting a category filters the post list. "All Categories" pill resets the filter.
5. **FAQ page visual improvements** — Added category pills (All, Shipping, Orders, Products, Rewards) with icon mapping. FAQ items now have icons (Truck, RotateCcw, Gift, Calendar, Award). Active/open accordion items have gold border highlight. Contact section has decorative gradient circles.

### Files Modified
- `src/lib/store.ts` — Fixed `formatPrice()` to multiply by 1000
- `src/components/layout/Header.tsx` — Fixed search result price to use `formatPrice()`, added import
- `src/components/pages/FAQPage.tsx` — Complete rewrite with i18n, category filter, icons, better styling
- `src/components/home/HomePage.tsx` — Added Recently Viewed section, event listener for real-time updates
- `src/components/BookCard.tsx` — Dispatch `recently-viewed-updated` event on view
- `src/components/pages/BookDetailPage.tsx` — Dispatch `recently-viewed-updated` event on view
- `src/components/pages/BlogPage.tsx` — Added category filter state, pills, filtered blog logic

## Verification Results
- `bun run lint` passes cleanly (zero errors, zero warnings)
- TypeScript compilation succeeds
- Price fix verified: raw DB value 79.99 now displays as "Rp79.990" via `formatPrice(79.99) -> Intl.NumberFormat(79990)`
- FAQ i18n: All 6 questions have Indonesian translations in the component mapping
- Blog category filter: Extracts unique categories from blog data, filters correctly
- Recently viewed: localStorage tracking + CustomEvent dispatch verified in code review

## Unresolved Issues / Risks
- Turbopack cache corruption: server may crash after heavy file changes; requires `rm -rf .next` to recover
- URL never changes during SPA navigation (state-based, not URL-based) — known architecture limitation
- Cart discount display could be clearer (shows raw "Discount: -IDR15" format)
- Dev server process may die unexpectedly when background bash commands time out

## Priority Recommendations for Next Phase
1. Implement full order creation flow (checkout form → order saved to DB via API)
2. Add admin CRUD operations (create/edit/delete books, categories) in AdminDashboard
3. Add order tracking page with visual timeline (OrderTrackingPage exists but needs data)
4. Enhance UserDashboard with working wishlist tab and order history from DB
5. Consider URL-based routing for SEO and deep linking
6. Add more book data (currently 20 titles) and blog content
7. Add reading progress tracking feature
8. Improve dark mode consistency across all new components
