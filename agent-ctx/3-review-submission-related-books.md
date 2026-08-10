# Task 3: Review Submission + Related Books

## Agent: Full-Stack Developer
## Task ID: 3

### Summary
Implemented two features for BookDetailPage:
1. **User Review Submission** — Full review form with title input, validation, already-reviewed detection, and new slug-based API endpoint
2. **Related Books Section** — Horizontal scrollable row of related books (sorted by category match > author match > rating)

### Changes Made

#### Prisma Schema
- Added `title String?` field to Review model

#### New API Endpoint
- Created `/src/app/api/books/[slug]/reviews/route.ts` POST handler
- Validates auth, rating (1-5), comment (10-1000 chars), title (5-200 chars optional)
- Returns 409 Conflict if user already reviewed
- Creates review in transaction, recalculates book average rating

#### BookDetailPage.tsx
- Added imports: `BookMarked`, `PenLine`, `Loader2`, `Input`
- Added `reviewTitle` state and `relatedBooks` state
- Added `userReview` computed value via useMemo
- Updated `handleSubmitReview` to use new slug-based endpoint, handle 409, validate min length
- Enhanced review form: title input, 1000 char limit, animated validation hint, loading spinner
- Added already-reviewed display card when user has existing review
- Added review title display in review list items
- Added Related Books section with BookMarked icon, horizontal scroll, sorted by relevance

#### i18n.ts
- Added 14 new keys (7 per locale): review.submit, review.submitting, review.titlePlaceholder, review.commentPlaceholder, review.loginToReview, review.alreadyReviewed, review.yourReview, review.editReview, review.success, review.minLength, review.titleOptional, review.noTitle, book.related, book.relatedDesc

### Lint Result
- `bun run lint` — 0 errors, 0 warnings ✅
