# Task 2-b: Enhance Book Detail Page & HeroSection i18n

## Changes Made

### 1. i18n Keys Added (`src/lib/i18n.ts`)
- **Hero keys**: `hero.badge`, `hero.featured`, `hero.readers`, `hero.titles`, `hero.rating`
- **Book detail keys**: `book.share`, `book.reviewPlaceholder`, `book.ratingLabel`, `book.reviewLabel`, `book.loginToReview`
- Both `id` and `en` locales updated

### 2. API Fix (`src/app/api/reviews/route.ts`)
- Made `comment` field optional (previously required, now accepts null/empty)
- Updated validation to only check comment length if provided
- This allows users to submit star-only reviews

### 3. BookDetailPage Enhancements (`src/components/pages/BookDetailPage.tsx`)
- **Review Submission Form**: 
  - Fixed to POST to `/api/reviews` with `{ bookId, rating, comment, userId }`
  - Added character counter (max 500 chars)
  - On success: shows toast, appends new review to displayed list, updates rating display
  - Uses `t('book.submitReview', locale)` for submit button
  - Shows login prompt for unauthenticated users
  - Star rating hover animation with gold #D4AF37 color

- **Buy Now Button**: Already existed, verified working (adds to cart + navigates to checkout)

- **Styling Improvements**:
  - Gold gradient line dividers between sections (stock/quantity, quantity/actions, metadata/share)
  - Share row with Twitter, Facebook, WhatsApp, Copy Link icon buttons
  - Book metadata grid with gold left borders (`border-l-2 border-[#D4AF37]/40`)
  - Rating distribution progress bars (5★ to 1★) with gold gradient fills, bell-curve based on average

- **Rating Distribution Summary**: 
  - Overall rating + stars on the left
  - Visual bar chart on the right showing 5★, 4★, 3★, 2★, 1★ distribution
  - Gold gradient bars with smooth animation

### 4. HeroSection i18n (`src/components/home/HeroSection.tsx`)
- Replaced 'Premium Novel Bookstore' with `t('hero.badge', locale)`
- Replaced 'Where Every Story Matters' with split `t('hero.title', locale)` (EN preserves original layout, ID splits at midpoint)
- Replaced description with `t('hero.subtitle', locale)`
- Replaced 'Explore Collection' with `t('hero.cta1', locale)`
- Replaced 'View Bestsellers' with `t('hero.cta2', locale)`
- Replaced 'Featured' with `t('hero.featured', locale)`
- Replaced 'Happy Readers' with `t('hero.readers', locale)`
- Replaced 'Premium Titles' with `t('hero.titles', locale)`
- Replaced 'Rating' with `t('hero.rating', locale)`
- Featured book price: uses `$` format for EN locale, `formatPrice()` for ID locale
- All existing animations and layout preserved exactly

## Verification
- `bun run lint` passes with zero errors
