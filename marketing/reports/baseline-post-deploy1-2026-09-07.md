# M0 — בייסליין אחרי דיפלוי #1 (תוכנית הצמיחה)

תאריך: 7/9/2026 · נכס: `https://stepsnetanya.co.il/` · דיפלוי שנבדק: `steps-site-ff9m0f02y` (2026-09-07, ר' `docs/DEPLOY-LOG.md`) · סוג עבודה: קריאה בלבד מול האתר החי, בלי שינוי בדפי האתר.

זהו צילום המצב **אחרי** S1+S2+S3+RV1, לפני S4 (תוכן) ו-S5 (ויזואל). משמש נקודת השוואה ליום 30/60/90 (סעיף 9 בתוכנית).

---

## 0. תיקון תשתית שנדרש לפני שהעבודה יכלה לרוץ

הסקיל `claude-seo` (`~/.claude/skills/claude-seo/scripts/drift_baseline.py`) לא עבד כלל על Windows: קרא ל-`fetch_page.py` עם `--output /dev/stdout` (נתיב שלא קיים ב-Windows), ולאחר מכן קרס גם על קידוד — קונסולת Windows (cp1255) לא הצליחה להדפיס/לפענח עברית מה-subprocess. תוקן (3 שינויים ב-`drift_baseline.py`: הסרת `--output /dev/stdout`, `PYTHONIOENCODING=utf-8`, ו-`encoding="utf-8", errors="replace"` בכל קריאות ה-subprocess). זהו תיקון תשתית לכלי, לא לאתר — משפר גם סשנים עתידיים שירצו `/seo drift compare` ל-M/יום-30.

כלים שנשארו לא זמינים (לא תוקן — תלות חסרה, לא באג):
- **PageSpeed/CrUX API** (`pagespeed_check.py`) — אין `GOOGLE_API_KEY` מוגדר; המכסה האנונימית חסומה. **עקפנו דרך ממשק הרשת של PageSpeed Insights בדפדפן** (לפי המשימה) — זה עבד תקין.
- **Google Search Console API** (`gsc_inspect.py`) — לא מחובר בסביבה הזו (אף שהנכס עצמו מאומת ב-GSC, ר' זיכרון). לכן בדיקת האינדוקס כאן היא מדגם `site:` בגוגל, לא דוח GSC רשמי.
- ייצוא PDF (weasyprint) — כצפוי מהמשימה, לא נבדק; הפלט כולו Markdown.

---

## 1. Drift baseline — 10 דפי הלקוחות

נשמר ב-SQLite (`~/.cache/claude-seo/drift/baselines.db`), זמין ל-`/seo drift compare` ביום 30/60/90. כל 10 הדפים חזרו 200 והוטמעו בהצלחה (title, meta description, canonical, robots, H1, H2/H3, סכמה, OG, hash של ה-HTML):

| דף | Schema (JSON-LD בלוקים) | H2 | H3 | OG tags |
|---|---:|---:|---:|---:|
| index.html | 2 | 11 | 10 | 7 |
| pilates.html | 4 | 10 | 4 | 7 |
| gym-women.html | 4 | 10 | 1 | 7 |
| barre.html | 4 | 10 | 1 | 7 |
| kids.html | 2 | 3 | 6 | 7 |
| nutrition.html | 3 | 14 | 2 | 7 |
| pilates-price.html | 4 | 8 | 4 | 7 |
| pilates-beginners.html | 4 | 9 | 4 | 7 |
| pilates-postpartum.html | 4 | 10 | 2 | 7 |
| pilates-or-gym.html | 4 | 8 | 5 | 7 |

כל 10 הדפים: `robots: index, follow`, canonical עצמי-תואם, סטטוס 200. זו נקודת ההשוואה — אם משהו מהמספרים האלה ישתנה בהשוואה עתידית בלי כוונה, זה דגל.

---

## 2. שלוש בדיקות עומק — הבית, בר, ילדים, מחירון

בוצע מול הדומיין החי (לא רק קוד מקומי). ריכוז ממצאים, מדורג לפי חומרה. **לא תוקן דבר בדפים** — זו רשימת המלצות בלבד.

### 🔴 גבוה — משפיע על מהירות טעינה בפועל
- **תמונות דף הילדים כבדות מדי:** `kids-hero.jpg` (655KB, `loading="eager"`, זו גם תמונת ה-LCP) ו-`kids-posture.jpg` (594KB). גם `og:image`/`twitter:image` מצביעות לאותה תמונה הכבדה — משפיע גם על תצוגה מקדימה בוואטסאפ/פייסבוק. **זה כבר ידוע ומתוכנן ב-S5** (המרה ל-webp/avif ≤150KB), אין כאן ממצא חדש — רק אישור שהוא עדיין פתוח.
- `teen-barre-clean-v2.jpg` (337KB) ו-`teen-pilates-real-studio-v3.jpg` (205KB) — אותה בעיה, מעל סף האזהרה (200KB).

### 🟡 בינוני
- **FAQPage schema לא יעיל בגוגל בכל ארבעת הדפים שנבדקו** (בית, בר, ילדים, מחירון): מאז 8/2023 גוגל מציג FAQ Rich Results רק לאתרי ממשלה/בריאות. STEPS לא זכאי — הסכמה תקינה תחבירית אבל לא תפיק כוכבית ב-SERP. **החלטה נדרשת:** להשאיר כתשתית ל-AI/GEO (Google AI Overviews/ChatGPT עדיין יכולים לקרוא FAQPage גם בלי rich result), או להסיר. לא דחוף.
- **כותרות (title) ארוכות מדי:** `pilates-price.html` — 76 תווים (יעד 50–60), `barre.html` — 64 תווים. גוגל צפוי לקצץ ב-SERP.
- **`index.html`: "יוגה" מופיע כ-Offer נפרד בסכמה** (`hasOfferCatalog`) שמצביע ל-`barre.html`, אבל אין בעמוד עצמו שיעור/תוכן יוגה — המילה מופיעה רק בטאגליין בפוטר. סיכון markup-לא-אמיתי (Google Structured Data guideline). בנוסף שני Offer-ים שונים ("יוגה" ו"אימוני בר") מצביעים לאותו URL בדיוק.
- **CSP חלקי בכל הדפים שנבדקו:** מוגדר רק `frame-ancestors 'self'` (ב-`vercel.json`), אין `script-src`/`default-src` — לא הגנת XSS אמיתית. גלובלי (`vercel.json`), לא ספציפי לעמוד.
- **`pilates-price.html`: טקסט `<h2>` בלי רווח לפני `<br>`** (שורות 319, 391) — "מחירשאנחנו" נקרא כמילה אחת בחילוץ טקסט (מנועי חיפוש/קוראי מסך). תיקון קוסמטי-טקסטואלי, לא ויזואלי.

### 🟢 נמוך / לא דחוף
- Meta description ארוך ב-1–12 תווים מהיעד ב-2 דפים (`pilates-price` 172, `barre` 161) — קיצוץ זניח צפוי.
- כמה תמונות פוסטר/גלריה בבית עדיין JPG ולא WebP (אף אחת לא מעל 120KB — לא קריטי).
- `pilates-price.html`: `aggregateRating` (4.8/31) חסר ב-`HealthClub` שם, אף שהעמוד עצמו מקשר לביקורות האמיתיות — אפשר להוסיף (מבוסס נתון אמיתי שכבר מוצג).
- אין `BreadcrumbList` ב-`kids.html`.
- `priceRange` בפורמט `"₪230-₪530"` (סימן ₪ ולא הפורמט הסטנדרטי של גוגל `$$$`) — לא שגיאה רשמית.

### ✅ תקין — לא לגעת
בכל 4 הדפים: HTTPS+HSTS, robots.txt (כולל הרשאה מפורשת לכל בוטי ה-AI), sitemap.xml, canonical עצמי, `meta robots: index,follow`, כותרות אבטחה (למעט CSP החלקי), H1 יחיד בכל דף בלי דילוג רמות, alt תיאורי בכל תמונה, HealthClub/Article/BreadcrumbList (חוץ מ-kids) תקינים ומלאים, קישוריות פנימית תקינה, כל קישורי WhatsApp נושאים "(הגעתי מהאתר)".

---

## 3. מהירות — PageSpeed Insights (מובייל, דרך ממשק הרשת — ה-API חסום במכסה)

| דף | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Speed Index |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| הבית | 81 | 97 | 100 | 100 | 4.2s | 0 | 260ms | 2.4s |
| pilates.html | 78 | 100 | 100 | 100 | 5.4s | 0 | 70ms | 3.9s |
| kids.html | 100 | 100 | 100 | 100 | 1.4s | 0.002 | 0ms | 1.1s |

נתוני שדה (CrUX, חוויית משתמשים אמיתית) — **אין נתונים** בשלושת הדפים (האתר/הדף עדיין לא צבר מספיק תנועה למדד שדה של גוגל). הציונים למעלה הם מדידת מעבדה (Lighthouse, Moto G Power מדומה, Slow 4G) — לא מייצגים בהכרח את חוויית המשתמש בפועל, אבל כן אינדיקציה תקפה.

תמוה: `kids.html` (הדף שהאודיט לעיל מצא בו את התמונות הכי כבדות) קיבל Performance 100 ו-LCP 1.4s — כי אלמנט ה-LCP בפועל הוא כנראה טקסט/רקע, לא `kids-hero.jpg` שהיא lazy יחסית לקיפול. `pilates.html` דווקא עם LCP הכי גרוע (5.4s) — worth revisit ב-S5 גם אם לא ברשימת הדפים שנבדקו לעומק כאן.

---

## 4. אינדוקס — מדגם `site:stepsnetanya.co.il` בגוגל (לא GSC רשמי)

10 תוצאות הוצגו (גוגל הודיעה שהשמיטה כמה כמעט-כפולות): הבית, `pilates.html`, `barre.html`, `nutrition.html`, `kids.html`, `accessibility.html`, `pilates-price.html`, `pilates-postpartum.html`, `pilates-beginners.html`, `gym-women.html`. **חשוב:** זה מדגם, לא ספירת אינדוקס אמיתית — ל-GSC יש נתון מדויק (ר' `STEPS-search-baseline-2026-09-05.md`: 10 באינדקס, 2 לא — privacy.html בכוונה, kids.html היה "לא נכלל" נכון ל-28/8 אבל אומת שהוא כן נוסף ב-5/9 אחרי בקשת אינדוקס). לא נשלחה כאן שום בקשת אינדוקס נוספת. אין הופעה של קבצים פנימיים (ads-board.html וכו') — תקין, מאשר את `.vercelignore`.

---

## 5. רשימת תיקונים מוצעת — סדר עדיפות ל-RV2/S4

1. **תמונות דף הילדים (S5, כבר בתוכנית):** `kids-hero.jpg` 655KB, `kids-posture.jpg` 594KB, `teen-barre-clean-v2.jpg` 337KB, `teen-pilates-real-studio-v3.jpg` 205KB → webp/avif ≤150KB.
2. **כותרות ארוכות מדי:** לקצר `pilates-price.html` (76→≤60 תווים) ו-`barre.html` (64→≤60) — ייתכן כחלק מ-S4 (נספח B כבר כולל ניסוח מוצע לחלק מהדפים).
3. **`index.html` — "יוגה" בסכמה בלי תוכן תומך:** להסיר את ה-Offer או להוסיף תוכן יוגה אמיתי בעמוד (`barre.html`) — החלטת תוכן, לא באג טכני.
4. **החלטה על FAQPage schema** (בית, בר, ילדים, מחירון — כולם מוגבלים מ-2023 לאתרי ממשלה/בריאות): להשאיר לצורך GEO/AI, או להסיר. לא דחוף.
5. **`pilates-price.html` — רווח לפני `<br>` בשתי כותרות H2** (שורות 319, 391) — תיקון טקסט חד-שורתי.
6. **CSP חלקי (`vercel.json`)** — אם רוצים הגנת XSS אמיתית, להוסיף `script-src`/`default-src`. נמוך-עדיפות, לא שינוי דחוף.
7. אופציונלי/נמוך: `aggregateRating` ל-`HealthClub` במחירון, `BreadcrumbList` בילדים, המרת פוסטרים/גלריה בבית ל-WebP.

---

## 6. מה לא בוצע (במכוון, כמתוכנן)

- לא נשלחה שום בקשת אינדוקס.
- לא נגעתי ב-GBP.
- לא שונה אף קובץ אתר (רק תיקון תשתית לסקריפט הסקיל, מחוץ לריפו).
- `/seo content` / `/seo geo` / `/seo sxo` — לא הופעלו, לא בסקופ של M0 (מתוכננים ל-RV2 לפי לוח הביצוע).
