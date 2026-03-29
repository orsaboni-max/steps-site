# CLAUDE.md — STEPS Fitness Website

> Last updated: 2026-03-24

## Project Overview
Landing page for STEPS Fitness Center — women's fitness studio in Netanya Poleg.
3 spaces: GYM (strength), MOVE (classes), REFORMER PILATES.
~500 members. Owners: אור סבוני + אור תורג'מן.

## File Structure
```
C:\Users\USER\steps-site\
├── index.html              # Main page (522+ lines)
├── steps-logo-white.png    # Logo, white on transparent (95KB)
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
├── netlify.toml            # Netlify config (kept, not in use)
└── netlify\
    └── functions\
        └── schedule.mts    # Netlify version (not in use)
```

## Key Rules

### Before Every Change
1. Read the STEPS skill: `~/.claude/skills/steps-website/SKILL.md`
2. Never delete existing sections — only edit the target section
3. Verify RTL works after any layout change
4. Test mobile (768px) after any CSS change

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
