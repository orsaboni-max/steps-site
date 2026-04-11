# CLAUDE.md — STEPS Fitness Website

> Last updated: 2026-04-04

## Project Overview
Landing page for STEPS Fitness Center — women's fitness studio in Netanya Poleg.
3 spaces: GYM (strength), MOVE (classes), REFORMER PILATES.
~500 members. Owners: אור סבוני + אור תורג'מן.

## File Structure
```
C:\Users\USER\steps-site\
├── index.html              # Main page (522+ lines)
├── steps-logo-white.png    # Logo, white on transparent (95KB)
├── robots.txt              # Crawl rules + sitemap pointer
├── sitemap.xml             # XML sitemap for Google
├── vercel.json             # Vercel config
├── images\                 # Real photos from studio
│   ├── hero-new.png        # Hero background image (replaced gym-squat.png)
│   ├── gym-squat.png       # Old hero bg (unused)
│   ├── pain-bg.jpg         # Pain section background
│   ├── gym-card.jpg        # GYM space card + OG image
│   ├── move-card.jpg       # MOVE space card
│   ├── pilates-card.jpg    # PILATES space card
│   ├── testimonials-bg.jpg # Testimonials background
│   └── gallery-[1-5].jpg   # Gallery images
├── api\
│   └── schedule.ts         # Arbox API proxy → /api/schedule (Vercel)
├── barre.html              # SEO landing page: אימון בר בנתניה
├── [keyword].html          # SEO landing pages (see seo-landing-page-hebrew skill)
├── netlify.toml            # Netlify config (kept, not in use)
└── netlify\
    └── functions\
        └── schedule.mts    # Netlify version (not in use)
```

## Key Rules

### Before Every Change
1. Read the STEPS skill: `~/.claude/skills/steps-website/SKILL.md`
2. For new SEO landing pages: read `~/.claude/skills/seo-landing-page-hebrew/SKILL.md` (includes accessibility requirements in section 6)
3. Never delete existing sections — only edit the target section
4. Verify RTL works after any layout change
5. Test mobile (768px) after any CSS change
6. SEO landing pages: verify accessibility (♿ button, הצהרת נגישות, skip link, ARIA, alt text, WCAG AA contrast, keyboard nav)

### Mandatory Pre-Commit Checks
- [ ] Logo visible in navbar (44px height)
- [ ] Team USP cards present (grep "אפס פשרות" = 1)
- [ ] 6 real testimonials (grep "אתם הלב שלי")
- [ ] Mobile menu works (grep "mobBtn")
- [ ] SEO tags present (grep "og:title")
- [ ] WhatsApp number correct: 972527927575
- [ ] All text in Hebrew, feminine form for clients

### Deploy
```bash
# Vercel (current — active)
cd C:\Users\USER\steps-site
npx vercel --yes --prod
```

### Arbox Integration
- Vercel API Route: `api/schedule.ts`
- Endpoint: `/api/schedule?date=YYYY-MM-DD`
- Arbox API: `https://arboxserver.arboxapp.com/api/public/v3/schedule`
- Auth: `api-key` header from `process.env.ARBOX_API_KEY`
- Cache: 5 minutes (Cache-Control: max-age=300)
- Filter: `location_name.includes("פולג")`

### Design Tokens
| Token | Value |
|-------|-------|
| Font | Heebo |
| Accent (GYM/CTA) | #F5C518 (yellow — changed from #E8553D on 2026-03-29) |
| Teal (Pilates/Bina) | #2EC4B6 |
| Purple (MOVE) | #A855F7 |
| Dark bg | #111111 |
| Section padding | 90px 5% |
| Card radius | 14px |
| Button radius | 50px |
| Logo height navbar | 44px |
| Logo height footer | 38px |

### GitHub
- Repo: https://github.com/orsaboni-max/steps-site
- Branch: main
- .gitignore: .vercel, .netlify/, .claude/settings.local.json, *.mp4

### Vercel Config
- Project: `steps-site` (orsaboni-maxs-projects)
- Live URL: https://steps-site-xi.vercel.app
- Custom domain: stepsnetanya.co.il + www.stepsnetanya.co.il (added 2026-03-26, pending DNS)
- DNS required: A @ → 76.76.21.21, A www → 76.76.21.21
- Env vars: `ARBOX_API_KEY` (set via `npx vercel env add`)
- API Routes dir: `api/`

### Netlify (inactive — free tier exceeded)
- Site ID (primary): 93ef31b9-a9ac-4bd0-95b1-5c55c0cc6ff5
- Site ID (alt): 2f825b80-a654-4c51-aab3-fc6548472069

## Deploy Log
| Date | Platform | Deploy ID | Changes |
|------|----------|-----------|---------|
| 2026-04-04 | Vercel | dpl_3mW4BBEc56JQxD6YGQs8snZJ5xVW | New SEO landing page: barre.html (אימון בר בנתניה), added to sitemap.xml, footer link in index.html |
| 2026-03-30 | Vercel | dpl_4QvzJ5qMLjWKE6vKBtA7z1Endh7Q | Technical SEO: canonical trailing slash, Schema.org HealthClub JSON-LD, updated meta description, added hreflang=he |
| 2026-03-29 | Vercel | dpl_9XerSvUA6h6V | SEO fix: canonical+og:url→stepsnetanya.co.il (was stepsfitness.netlify.app), og:image→stepsnetanya.co.il, added robots.txt with sitemap pointer |
| 2026-03-29 | Vercel | dpl_HtjrCH6wGwbJBTo | GA4 (G-5T22VE9YHT) + Meta Pixel (1016773848190436) added to head |
| 2026-03-29 | Vercel | dpl_ERRDaHG6wx32 | 6 changes: Hero split layout (tag top, h1 bottom, space-between), accent #E8553D→#F5C518 yellow, GYM "סטודיו כושר", MOVE removed HIIT/קיקבוקס/עיצוב, team USP cards→single paragraph, rgba colors updated |
| 2026-03-28 | Vercel | dpl_6UXdXn64YYTM | Hero tag text: "3 חללי אימון · מקום אחד" → "פה את לעולם לא לבד." |
| 2026-03-28 | Vercel | dpl_9e4YCNSa8qJX | Hero v3: removed duplicate logo, text→bottom (flex-end), gradient dark-bottom/clear-top, bg-position center 30%, mobile font sizes reduced, 100svh |
| 2026-03-28 | Vercel | dpl_2wmEbojs8NyRo | Hero redesign: text→top (flex-start+padding), gradient dark-top/clear-bottom, bg-position center 60%, text-shadow, mobile logo max-width:70px |
| 2026-03-28 | Vercel | dpl_GN8zHiNMm7ZvS | Hero: replaced gym-squat.png with hero-new.png, background-position center center |
| 2026-03-26 | Vercel | dpl_9QFghyFdqDzr | Fix 4 bugs: footer social links (IG/FB/WA), footer space links (#spaces/#bina), favicon.png, accessibility (♿ button + modal + skip-link + ARIA landmarks) |
| 2026-03-25 | Vercel | dpl_Yuy5MzqkcX2s | Team section: replaced 22 trainer cards with 4 USP cards (מוסמכות, רואות אותך, מתאמנות בעצמן, אוהבות), removed old team CSS |
| 2026-03-25 | Vercel | dpl_GGzFjh87Q8Kb | Remove טלי טרחוסבקי from team section, update count 22→21 |
| 2026-03-25 | Vercel | dpl_976k3Fr49Qqq | Fix mobile horizontal overflow: html/body overflow-x:hidden+max-width:100vw, all sections overflow-x:hidden, img max-width:100%, AOS fade-left/right overflow fix |
| 2026-03-25 | Vercel | dpl_5bpE821opmfL | AOS scroll animations (52 data-aos attrs): fade-up/left/right/zoom-in on all sections, staggered delays on cards/team/gallery |
| 2026-03-25 | Vercel | dpl_udpMw3HAUmBQ | Hero: video→static bg image (gym-squat.png), overlay gradient to bottom 0.35→0.65 |
| 2026-03-25 | Vercel | dpl_22k8JrLksmAfihvJYLDTTLj9N3Ca | Hero video brightness 0.35→0.45 + enhanced video (contrast/saturation) + pain overlay lighter gradient |
| 2026-03-25 | Vercel | dpl_DnvJqTs1VkAAKYcu1mKuhks9qzuq | Real images + hero video (compressed 4.3MB) + gallery + OG image + mobile shortcuts |
| 2026-03-25 | Vercel | dpl_FwXV2i38BFV1ToP44KCBMdvvhqbn | Strip → Spotlight sweep (setInterval 800ms, glow highlight cycles through items) |
| 2026-03-24 | Vercel | dpl_5nVgGkgjPFPmoKSHvUHGWLrAiwLz | Marquee → static strip (flex, 8 items with | separators, no animation) |
| 2026-03-24 | Vercel | dpl_8z8b9HNjTNUCoDnKax9TkrSZdv4R | Marquee smooth: scrollamount=2, scrolldelay=16 (60fps), 6 nbsp spacing |
| 2026-03-24 | Vercel | dpl_GdjHotqS4Nzs6UVnstioEb4U8SZ2 | Marquee → native <marquee> tag (deprecated but 100% cross-browser incl iOS Safari) |
| 2026-03-24 | Vercel | dpl_H4akKyrqWyzM3GUXTTjCLokcn4VV | Marquee fix: window.load + offsetWidth after render, 2 spans for seamless loop |
| 2026-03-24 | Vercel | dpl_7WenHFTeBQ9NTE8sLxStQDooq86a | Marquee → requestAnimationFrame JS (CSS animation removed, works on Safari iOS) |
| 2026-03-24 | Vercel | dpl_5bsrEt5P3fKUPGFa4UnG6YH6izym | Mobile: bina-sec hidden, team-extra collapsed with show-btn |
| 2026-03-24 | Vercel | dpl_4UnzkoeDXRAzGwuMaGfrhzXkVzZv | CTA → Arbox iframe (trial filter); navbar+schedule buttons → #contact scroll; marquee → inline-flex min-width:200% |
| 2026-03-24 | Vercel | latest | Arbox links → bp4jsudd1589999012.web.arboxapp.com homepage (3 places) |
| 2026-03-24 | Vercel | prev | Arbox links: lowercase → uppercase BP4JSUDD (3 places) |
| 2026-03-24 | Vercel | prev | Marquee: full inline-style rewrite, @keyframes marquee, no class CSS |
| 2026-03-24 | Vercel | prev | Arbox booking links: schedule btn + CTA btn + navbar הצטרפי |
| 2026-03-24 | Vercel | prev | Fix: navbar logo 36px, hero no btn + text update, marquee inline-flex |
| 2026-03-24 | Vercel | prev | Fix: removed GYM/MOVE/PILATES badges from schedule |
| 2026-03-24 | Vercel | dpl_npse7b3y | Fix: navbar logo→text STEPS, marquee infinite loop |
| 2026-03-24 | Vercel | dpl_GYzq3GCL | Hero centered + marquee dark + חללים + Bina features + schedule WA CTA |
| 2026-03-24 | Vercel | dpl_6j1jMVz9 | Migrated to Vercel — Arbox schedule live |
| 2026-03-24 | Netlify | 69c264d4 | Arbox live schedule + Netlify Function |
| 2026-03-24 | Netlify | 69c25e96 | SEO + mobile menu + logo transparent |
| 2026-03-24 | Netlify | 69c25b7e | Logo transparent 44px |
| 2026-03-24 | Netlify | 69c259d8 | Full V4: logo + 22 team + testimonials |

## TODO
- [x] Custom domain stepsnetanya.co.il added to Vercel (pending DNS A record)
- [x] Real photos/videos from social media manager
- [x] Custom domain
- [x] Google Analytics GA4 (G-5T22VE9YHT) + Meta Pixel (1016773848190436)
- [ ] Accessibility (נגישות)
- [ ] Real client names on testimonials
- [x] OG image (studio photo instead of logo)
- [ ] Full mobile QA

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

## Token Optimization
- Default model: /model opusplan (Opus for planning, Sonnet for execution)
- In plan mode: respond in 100 words or less
- Never use Opus for simple file edits, formatting, or mechanical tasks

## Claude Code Advanced Features

### /loop — Site Monitoring
- `/loop 1h` לבדיקת שהאתר stepsnetanya.co.il מגיב (HTTP 200)
- `/loop 6h` לבדיקת שה-GA4 snippet (G-5T22VE9YHT) ו-Meta Pixel (1016773848190436) קיימים בדף
- `/loop 1d` לבדיקת שאין 404 errors בדפי SEO landing pages
- loop = session-scoped, לא persistent

### Monitor Tool
- להשתמש ב-Monitor כשמריצים build/deploy של Vercel — מתריע רק על שגיאות
- לא צריך Monitor לשינויים קטנים באתר

### Ultraplan
- לא רלוונטי לפרויקט הזה — השינויים באתר קטנים מדי בשביל תכנון בענן
