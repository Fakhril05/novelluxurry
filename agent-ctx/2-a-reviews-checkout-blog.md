# Task 2-a: Reviews API, Checkout Enhancement, Blog Detail Enhancement

## Summary
Completed all 3 deliverables for Task 2-a:

### 1. Reviews API (`/api/reviews/route.ts`)
- Created POST endpoint at `src/app/api/reviews/route.ts`
- Validates: bookId, userId, rating (1-5 integer), comment (1-1000 chars)
- Verifies book and user existence before creating review
- Uses Prisma `$transaction` to atomically:
  - Create the review record
  - Recalculate and update the book's `rating` (average) and `reviewCount`
- Returns created review with userName on success (201)

### 2. Checkout Page Enhancement
- Updated expedition options with real costs:
  - JNE Reguler (Rp 15,000, 5-7 days)
  - JNE YES (Rp 25,000, 2-3 days)
  - SiCepat REG (Rp 12,000, 4-6 days)
  - SiCepat BEST (Rp 20,000, 1-2 days)
  - Anteraja (Rp 18,000, 3-5 days)
- Added bilingual ETA display (id/en) using `etaEn` property
- Shows shipping estimation note under cost in order summary
- Points earned display (1 point per Rp 10,000) shown in gold accent box
- Updated order number format to `NVL-YYYYMMDD-XXXX` (4 random digits)
- Points calculation updated in API: `Math.floor(total / 10000)`
- Success toast shows order number and points earned using i18n keys
- Navigates to dashboard orders tab on success

### 3. Blog Detail Page Enhancement
- Added `Clock` icon import and `estimateReadTime()` utility function
- Reading time estimate shown in meta area (based on word count / 200 wpm)
- Author info card with gold accent styling (avatar icon, author label, name)
- Related articles section at bottom (filters out current, shows max 3)
- Related articles have: image, date, reading time, title with hover effects
- Back button uses i18n key `blog.backToBlog`
- Read More links in blog grid use i18n key `blog.readMore`

### 4. i18n Keys Added (both id and en)
- `book.submitReview`, `book.reviewSuccess`
- `checkout.success`, `checkout.orderNumber`, `checkout.pointsEarned`, `checkout.shippingNote`
- `blog.readMore`, `blog.readTime`, `blog.backToBlog`, `blog.relatedArticles`

### Verification
- `bun run lint` passes with zero errors
