# Task 3-c: Admin CRUD API Endpoints & Dashboard Enhancement

## Summary
Created RESTful admin API endpoints for books and categories with full validation and dependency checks. Enhanced AdminDashboard with search/filter functionality, updated to use new admin APIs, and replaced all hardcoded strings with i18n t() calls.

## Files Created
- `/src/app/api/admin/books/route.ts` — GET (search/filter/sort/paginate), POST (validated create)
- `/src/app/api/admin/books/[id]/route.ts` — GET one, PUT (validated update), DELETE (with order item dependency check)
- `/src/app/api/admin/categories/route.ts` — GET all, POST (validated create with slug uniqueness)
- `/src/app/api/admin/categories/[id]/route.ts` — PUT (validated update), DELETE (with books dependency check)

## Files Modified
- `/src/lib/i18n.ts` — Added 90 admin CRUD i18n keys (id + en)
- `/src/components/pages/AdminDashboard.tsx` — Full rewrite with:
  - BooksTab: search bar (title/author/ISBN with debounce), category/format/status filter selects, sort dropdown, RESTful API calls
  - CategoriesTab: RESTful API calls, error message display on delete conflict
  - All tabs: full i18n support via t() function
  - Error handling: API validation errors displayed in toasts and delete dialogs

## Key Design Decisions
- Admin API uses RESTful `[id]` segment pattern (not query params like public API)
- Validation returns 400 with details array; slug conflicts return 409
- Delete endpoints check dependencies: books with order items (409), categories with books (409)
- Book delete cascades: reviews and wishlists are cleaned up before book deletion
- Client-side search/filter/sort for instant responsiveness on the books table
- Removed unused `Eye` icon import

## Verification
- ESLint: 0 errors, 0 warnings
- Dev server: compiles and serves successfully
