# Task 2-c: CSS Utility Classes & Footer Enhancement

## Status: Completed

## Changes Made

### 1. globals.css - New CSS Utility Classes
Added 6 new utility classes to the `@layer utilities` block:
- **`.border-gold-animated`** - Animated gold border with rotating gradient (uses `rotate-border` keyframes)
- **`.text-shadow-gold`** - Premium gold text shadow effect
- **`.glass-card-gold`** - Glassmorphism card with gold border that intensifies on hover (dark mode aware)
- **`.float-label`** - Gentle floating label animation (3px vertical oscillation, 6s cycle)
- **`.heading-gold`** - Rich multi-stop gold gradient text for section headings
- **`.divider-gold`** - Premium divider with gradient lines fading from transparent to gold

Added 2 new keyframes:
- **`rotate-border`** - Rotates gold gradient through 0°/90°/180°/270°/360° over 4s
- **`float-gentle`** - Subtle 3px vertical float over 6s

### 2. Footer.tsx - Visual Polish Enhancements
- **Back to Top button**: Fixed bottom-right (z-30), gold gradient circle with ChevronUp icon, appears after 400px scroll with smooth translate/opacity transition, smooth scroll to top on click
- **Social media links**: Replaced Facebook with TikTok (Music2 icon) and added YouTube (Youtube icon) - now shows Instagram, Twitter, TikTok, YouTube with gold hover effects and scale animation
- **Copyright line**: Updated to `© 2024 Noveluxe. {t('footer.rights', locale)}` as specified
- **Gold gradient line**: Enhanced top-of-footer gradient to `via-[#D4AF37]/40` (was /30) for better visibility
- **Newsletter description**: Added secondary description text below subtitle: "Dapatkan update novel terbaru dan promo eksklusif" / "Get the latest novel updates and exclusive promos"
- **Subscribe button**: Replaced flat gold bg with animated gold gradient (`from-[#D4AF37] via-[#E8D48B] to-[#D4AF37]`) with hover shift and shadow glow
- **Social button styling**: Added `text-white/50` base with `hover:text-[#D4AF37]` for better visual feedback

## Verification
- `bun run lint` passes with zero errors
