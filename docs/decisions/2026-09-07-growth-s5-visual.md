# S5 — ויזואל (Higgsfield) · 7/9/2026

ענף: `claude/optimistic-cannon-c406fb` · שלושה commits · **שלב א (נכסים) בלבד. אין שילוב ב-HTML.**

## מה נבנה

| # | נכס | כלי | קובץ | משקל | תקרה |
|---|---|---|---|---|---|
| 1 | פתיח דסקטופ | Higgsfield `upscale_video` topaz 9:16 1080p → ffmpeg | `images/shoot2025/hero-cine-1080.mp4` | 1.81MB | 2.5MB |
| 1 | פתיח נייד | ffmpeg 540×960 crf28 | `images/shoot2025/hero-cine-1080-mobile.mp4` | 406KB | 500KB |
| 1 | פוסטר | PIL מהפריים החדש | `…-poster.webp` / `.jpg` | 95KB / 191KB | 120KB / 200KB |
| 2 | 10 תמונות שיתוף | PIL בלבד (בלי AI) | `images/og/*.jpg` | 68–130KB | 150KB |
| 3 | תמונות הילדים | — | בוצע ב-S2 | — | — |
| 4 | איור חלקי הרפורמר | `generate_image` gpt_image_2 high 3:2, 2 גרסאות | `images/reformer-parts.webp` | 40KB | 120KB |

## החלטות

- **הפתיח:** אותו קליפ שאור בחר, רק חידוד. לא הוספנו שום תוכן AI, לא reframe, לא שוליים.
- **תמונות השיתוף:** צילומי סטודיו אמיתיים בלבד + פס כהה (`#0B0B0B`) + כותרת עברית ב-Heebo 900 דרך `bidi.get_display()` + הלוגו כגרפיקה נפרדת בפינה. **אין ערבוב עברית ואנגלית בשורה אחת.** נבנות מחדש בפקודה אחת: `python marketing/creative/og/make-og.py`.
- **10 ולא 9:** תוכנית הצמיחה כתבה "9 תמונות" אבל רשימת הכותרות מונה 10 עמודים. נבנו 10 — לכל עמוד עם `og:image` יש תמונה.
- **מקורות שהוחלפו מול נספח E:** פילאטיס `gallery-a` → `gallery-e` ומחירון `gallery-a` → `hero-main`, כי `gallery-a` הוא צילום משקולות ולא רפורמר — מטעה לנושא הדף. השוואה `gym-main` → `gym-alt` כדי שלא תהיה תמונה כפולה מול דף ה-GYM.
- **האיור:** נבחרה הגרסה שבה עמוד הגלגלות מחובר למסגרת (בשנייה הוא מרחף). ללא טקסט ברנדר — רק נקודות ממוספרות 1–6; המקרא בעברית נכתב ב-HTML.

## אימות

- 21 הבדיקות ירוקות (`node --test tests/website.test.mjs api/lead.test.mjs`).
- כל הנכסים מתחת לתקרת המשקל (טבלה למעלה).
- לפני/אחרי של הפתיח ב-100% crop: `marketing/creative/og/hero-before-after.jpg`.
- גיליון 10 התמונות: `marketing/creative/og/contact-sheet.jpg`.

## אישורי אור

- ✅ **העברית המרונדרת ב-10 תמונות השיתוף — אושרה** (7/9, "כן העברית תקינה").
- ⏳ לפני/אחרי של הפתיח — נשלח, ממתין.
- ⏳ הרנדר של האיור — נשלח, ממתין.

## קרדיטים Higgsfield

582.18 → **572.18** (חידוד וידאו ~3, איור ×2 = 7). התקרה 300 רחוקה.

## מה נשאר — שלב ב (שילוב)

**חסום עד ש-S4 (`claude/s4-content`) יתמזג ל-main**, כי הוא נוגע באותם קבצי HTML.
כשזה קורה, בענף מ-main:

1. `og:image` + `twitter:image` + `og:image:width` 1200 / `og:image:height` 630 בעשרת הדפים → `images/og/<slug>.jpg`.
2. `index.html` שורות ~796–800: `data-src` / `data-src-sm` / `poster` למקורות `hero-cine-1080*`; וגם `<link rel=preload>` בשורה 40 ו-JSON-LD `"image"` בשורה 55.
3. `pilates-beginners.html`: `<figure>` עם `images/reformer-parts.webp`, מקרא עברי (1 מוט רגליים · 2 עגלה נעה · 3 משענות כתפיים · 4 עמוד גלגלות · 5 רצועות · 6 קפיצים) ו-`<figcaption>תמונת המחשה שנוצרה ב־AI</figcaption>`.
4. `sitemap.xml` — `lastmod` לדפים ששונו.
5. commit `feat(site): wire og images + hero`, אז RV2. **לא deploy מכאן.**
