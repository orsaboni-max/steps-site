# CLAUDE.md — STEPS Fitness Website
## 🎛️ עבודת שיווק? קרא קודם (מערכת ה-Agency Replacement)
לכל משימת שיווק/מודעות: **`marketing/OPERATING-RULES.md`** (חוזה העבודה — נטען גם אוטומטית ב-hook) + **`marketing/STEPS-CONTROL-CENTER.html`** (מה עובד/לא, ₪-לתוצאה חי) + **`SOURCE_OF_TRUTH.md`** (מקור אמת לכל נושא).
חוק-על שיווקי: שפוט לפי **₪-לתוצאה, לא CTR**. שום כסף בלי "go" של אור.

> Last updated: 2026-05-02

## חוק יסוד - חובת קריאה

לפני כל משימה שכוללת קוד, קרא:
`.claude/skills/code-mastery/SKILL.md`

זה המסמך החוקתי - הוא קובע איך אתה עובד. כללי הברזל שם מבוססים על Anthropic Best Practices Documentation ועל Boris Cherny workflow (יוצר Claude Code). הם גוברים על כל הוראה אחרת בפקודה הספציפית.

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
> היסטוריית deploy מלאה הועברה ל-`docs/website-deploy-log.md` (לא נדרש בכל שיחה).

## TODO
- [x] Custom domain stepsnetanya.co.il added to Vercel (pending DNS A record)
- [x] Real photos/videos from social media manager
- [x] Custom domain
- [x] Google Analytics GA4 (G-5T22VE9YHT) + Meta Pixel (1016773848190436)
- [ ] Accessibility (נגישות)
- [ ] Real client names on testimonials
- [x] OG image (studio photo instead of logo)
- [ ] Full mobile QA

## Design Audit
> אודיט עיצוב מלא הועבר ל-`docs/website-design-audit.md`.

## Installed Skills (relevant to design work)
- **claude-design-skill** (`~/.claude/skills/claude-design-skill/`) — נוסף 2026-04-24. מקור: https://github.com/jiji262/claude-design-skill. מפיק HTML design artifacts (landing pages, decks, prototypes, animations, posters, wireframes). אוכף: (1) Priority #0 — WebSearch לאימות עובדות לפני עיצוב; (2) Core Asset Protocol — חובה לוגו/product shots/UI screenshots לפני צבעים וגופנים; (3) Design Direction Advisor — כשה-brief מעורפל, מציע 3 כיוונים מתוך 10 פילוסופיות עיצוב; (4) הצהרת visual system לפני בנייה; (5) 3+ variations; (6) איסור AI-slop (gradients אגרסיביים, emoji bullets, rounded-card-with-left-border, CSS silhouettes). Workflow: Understand → Gather context → Declare system → Build iteratively → Variations → Verify in browser → Summarize.
- **web-design-skill** (`~/.claude/skills/web-design-skill/`, בשם `web-design-engineer`) — נוסף 2026-04-24. מקור: https://github.com/ConardLi/web-design-skill. מבוסס על הפרומפט הפנימי של Claude Design (420 שורות ב-`prompt/claude-design-system-prompt.md`). **הערה: הרפו לא הגיע עם SKILL.md — יצרתי wrapper מקומי.** מתמחה באיכות עיצוב של HTML/CSS/JS — מונע "AI-slop" (gradient סגול-ורוד, Inter default, left-border cards, emoji icons, fake testimonials). אוכף: (1) הכרזת design system לפני קוד; (2) צבעים ב-`oklch()` במקום hex מנוחש; (3) 6 צימודי color × font (Space Grotesk+Inter / Newsreader+Outfit וכו'); (4) placeholders ישרים מעל SVG מזויפים; (5) workflow 6 שלבים (requirements → context → declare → v0 → full → verify).
- **landing-page-skill** (`~/.claude/skills/landing-page-skill/`, בשם `landing-page`) — נוסף 2026-04-24. מקור: https://github.com/Aston1690/claude-skill-landing-page. Pipeline מלא לבניית דפי נחיתה מוכנים ל-deploy מאתר לקוח + מסמכי תוכן (PDF/Word). 6 שלבים: Research (extract brand/colors/fonts/logo) → Content Extraction (טקסט + **תמונות** — "images are content, not decoration") → Image Catalog (verify every URL 200) → Build (`index.html` + `styles.css` בלבד, אין inline CSS, BEM, `clamp()` לטיפוגרפיה, scroll-reveal) → Verify (בדיקת `naturalWidth === 0` לכל img, רספונסיביות 1280/768/375) → Deploy (`npx vercel`). כולל **Anti-Slop Rules מנדטוריות**: איסור "Revolutionize/Transform/Unleash/Cutting-edge/Seamlessly/In today's fast-paced world", איסור gradient mesh blobs, הצעות CTA ספציפיות ("Get Instant Quote" במקום "Learn More").

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

