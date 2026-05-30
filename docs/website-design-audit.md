## Design Audit (2026-03-30)

### Architecture
Single-file static HTML (`index.html`, 625 lines). All CSS inline in `<style>` (~250 lines). All JS inline at bottom (~80 lines). No build system, no framework, no components. External deps: AOS 2.3.4 (scroll animations), Google Fonts (Heebo), GA4, Meta Pixel.

### Sections (top→bottom)
| # | Section | ID | Lines | Notes |
|---|---------|----|-------|-------|
| 1 | Navbar | `#nav` | 309-321 | Fixed, transparent→solid on scroll, logo 36px, 6 links + mobile hamburger |
| 2 | Hero | — | 324-333 | Full-bleed `hero-new.png`, 100svh, gradient overlay (dark edges/clear center), tag + H1 + subtitle, no CTA buttons |
| 3 | Spotlight strip | — | 336-360 | Yellow-bordered bar, 8 class names, JS highlight cycle (800ms setInterval) |
| 4 | Pain→Solution | `#pain` | 363-378 | Photo bg (`pain-bg.jpg`), dark overlay, 2×2 grid of problem/solution cards |
| 5 | Spaces | `#spaces` | 381-409 | 3 photo cards (GYM/MOVE/PILATES), 380px height, hover zoom, tags |
| 6 | Bina (nutrition) | `#bina` | 412-432 | 2-col grid: features list + fake phone mockup. **Hidden on mobile** (`display:none`) |
| 7 | Schedule | `#sched` | 435-447 | Light bg (#fafaf8), live Arbox API, day tabs (א-ו), CTA button below |
| 8 | Testimonials | `#reviews` | 450-464 | Photo bg (`testimonials-bg.jpg`), 85% black overlay, 6 cards, gradient bottom border on hover |
| 9 | Team | `#team` | 467-473 | Minimal — just title "מאמנות. אפס פשרות." + 1 paragraph. No trainer cards. |
| 10 | Gallery | `#gallery` | 476-485 | 4-col grid (first item spans 2×2), 5 real photos, hover zoom + label |
| 11 | CTA / Contact | `#contact` | 488-499 | Dark bg, Arbox iframe (trial booking), WhatsApp link below |
| 12 | Footer | — | 502-510 | 4-col grid: logo+desc, nav links, spaces links, contact info. Social icons (IG/FB/WA) |
| 13 | Accessibility | `#acc-modal` | 512-623 | Fixed ♿ button (bottom-left) → modal with accessibility statement |
| 14 | WhatsApp float | `.waf` | 516 | Fixed bottom-left, green circle, bounceIn animation |

### Typography
- **Single font**: Heebo (Google Fonts), weights: 300, 400, 500, 700, 900
- H1: `clamp(38px, 6.5vw, 68px)` weight 900 (mobile: `clamp(28px, 7vw, 48px)`)
- Section titles: `clamp(28px, 4vw, 42px)` weight 900
- Body text: 13-16px, weight 300-500
- Tags: 10-12px uppercase, letter-spacing 2-3px
- **Issue**: Single font family (Heebo for everything). No display/body pairing.

### Color System
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#F5C518` | Primary CTA, GYM color, section tags, hover states, team accent |
| `--accent2` | `#2EC4B6` | Pilates/Bina teal, checkmarks, bot messages |
| `--dark` | `#111111` | Page background, navbar solid, CTA section |
| `--white` | `#FAFAFA` | Body text color |
| Purple | `#A855F7` | MOVE badge dot, schedule MOVE badge |
| Green | `#25D366` | WhatsApp float |
| Blue | `#1565C0` | Accessibility button |
| Schedule bg | `#fafaf8` | Only light-colored section |
| **Issue**: Accent colors are used sparingly. Most text is white on dark with low-opacity rgba values (0.15–0.7). CTA overlay is `rgba(245,197,24,0.88)` — the only major color splash.

### Animations & Motion
| Type | Implementation | Count |
|------|---------------|-------|
| AOS scroll | `data-aos="fade-up/left/right/zoom-in"` | ~30 elements |
| AOS config | `duration:800, once:true, offset:100` | Global |
| CSS keyframes | `fadeIn`, `slideR`, `bounceIn` | 3 |
| Scroll reveal | `.reveal` class with IntersectionObserver | 2 elements (Bina section) |
| Spotlight | JS setInterval 800ms, text-shadow glow cycle | 8 items |
| Hover | Card translateY(-2/3px), image scale(1.05), border glow | Throughout |
| Navbar | Transparent→solid on scroll (0.95 alpha + blur(16px)) | 1 |
| **Issue**: Two competing scroll-animation systems (AOS + custom `.reveal`). Bina section uses `.reveal`, everything else uses AOS.

### CTA Flow
1. **Navbar**: "הצטרפי" → scrolls to `#contact` (Arbox iframe)
2. **Schedule section**: "קבעי אימון היכרות" button → `#contact`
3. **CTA section**: Arbox iframe embedded (trial booking filter) + WhatsApp link
4. **WhatsApp float**: Fixed green circle → wa.me/972527927575 with pre-filled message
5. **No hero CTA buttons** — hero has only text, no action buttons

### Responsive (mobile ≤768px)
- Pain grid: 2col→1col
- Spaces: 3col→1col (height 380→280px)
- Bina: **completely hidden** (`display:none`)
- Gallery: 4col→2col
- Footer: 4col→2col (→1col at 480px)
- Mobile menu: slide-in from right, 75% width, blur backdrop
- Hero: reduced font sizes, stacked CTA buttons

### Known Issues / Debt
1. **No hero CTA** — users land on full-screen photo with no action button
2. **Bina hidden on mobile** — entire nutrition section disappears on mobile
3. **Single font** — Heebo everywhere, no typographic contrast
4. **CSS in `<style>` tag** — all 250 lines inline, no external stylesheet
5. **JS in `<script>` tags** — all logic inline, no modules
6. **Two scroll-animation systems** — AOS + custom IntersectionObserver
7. **Emoji-based icons** — 📱🎯⚖️📊📷📘💬♿ instead of icon library
8. **Abbreviated class names** — `.sp`, `.tc`, `.bf`, `.si`, `.dt` — low readability
9. **Team section empty** — just a title and paragraph, no trainer data
10. **Lead form JS** — references `.lf input` and `.sb` but those are inside the CTA section which now has an Arbox iframe instead; possible dead code at line 595
11. **Spotlight strip** — `setInterval` runs forever, no cleanup
12. **Schedule fallback** — hardcoded fallback data includes "טלי טרחוסבקי" who was removed from team
13. **Accessibility button** — references `acc-modal` which exists but no actual a11y features (contrast toggle, font size, etc.)
14. **No favicon** — references `favicon.png` but file not listed in directory

