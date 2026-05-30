# STEPS Website — Deploy Log (history, moved out of CLAUDE.md)

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

