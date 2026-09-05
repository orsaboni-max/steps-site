# CLAUDE.md — STEPS Fitness Website

> Last updated: 2026-09-05

## עדכון ביקורת האתר — 5/9/2026
- אור אישר: שישי 07:30–13:00. במוצ״ש שיעור לפי המערכת בלבד, ללא קבלת קהל או מזכירות; אין לפרסם טווח פתיחה קבוע שלא אושר.
- חוג הילדים: גילאי 12–15; ראשון 17:00, שלישי 16:30, חמישי 17:00; 50–60 דקות; אימון היכרות 50 ₪. מחיר מנוי וגודל קבוצה מספרי טרם אושרו.
- `lead_form_submit` ו-Meta `Lead` נשלחים רק לאחר תשובת הצלחה מטופס הבית, פעם אחת. קליק Arbox/וואטסאפ הוא אירוע נפרד ואינו מוכיח ליד או רכישה. דף הילדים כולל אותה הסכמה לעוגיות כמו האתר.
- במערכת הבית נוסף מסנן ילדים ונוער; קבוצות אלו אינן מוצגות במסנן GYM. קישורי המלצות מפנים ל-`#team`, וטופס הפנייה קיבל `#contact`.
- `nutrition-v3.html` מוחרג מהעלאה ומוגדרת לו הפניה זמנית לדף התזונה. הטיוטה המקומית נשמרת.
- בדיקות: `node --test tests/website.test.mjs api/lead.test.mjs`; בדפדפן נבדקו מחשב, 768px ו-390px. מערכת השעות נקראה מהשירות הציבורי; תגובות טופס הודמו מקומית והמדידה החיצונית הושבתה בבדיקת הדפדפן.
- השינויים הוכנו בענף `codex/site-audit-fixes`; לא פורסמו במהלך המשימה. נתוני GA4/GSC, ייחוס קמפיינים בין דפים, רכישות Arbox ורישומים חיצוניים דורשים המשך נפרד. ההערות ההיסטוריות להלן מתארות את מצב אוגוסט.

## ✅ main היא המקור — מעלים מ-`C:\Users\USER\steps-site`
נסגר ב-2/8/26: הענף `claude/build-designed-website-e50334` מוזג ל-main,
והתיקייה הראשית מכילה את הדף החי. אין בה שינויים לא-מקומיטים.

**לפני כל deploy:** לוודא שהתיקייה שממנה מעלים מכילה את הדף החי
(`grep -c FFD400 index.html` צריך להחזיר 1). אם 0 — אתה בתיקייה הלא נכונה.

עבודה ישנה שהייתה לא-שמורה בתיקייה הראשית שמורה בענף
`backup/main-local-2026-08-01` — לא למחוק אותו.

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
├── content.css             # גיליון משותף ל-4 דפי התוכן בלבד
├── content.js              # JS משותף ל-4 דפי התוכן (ניווט/עוגיות/נגישות/מדידה)
├── pilates-price.html      # מדריך: כמה עולה פילאטיס מכשירים בנתניה
├── pilates-or-gym.html     # מדריך: פילאטיס או חדר כושר
├── pilates-postpartum.html # מדריך: פילאטיס אחרי לידה
├── pilates-beginners.html  # מדריך: פילאטיס מכשירים למתחילות
├── nutrition.html          # דף תוכנית התזונה (CSS/JS inline, לא content.css)
├── images\nutrition\       # 17 תמונות הדף + og.jpg (1200×630)
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
- [ ] Logo visible in navbar
- [ ] Team section present (grep `id="team"` = 1)
- [ ] Real testimonials (grep "אתם הלב שלי")
- [ ] Mobile menu works (grep "burger")
- [ ] SEO tags present (grep "og:title")
- [ ] WhatsApp number correct: 972527927575
- [ ] All text in Hebrew, feminine form for clients
- [ ] מערכת השעות טוענת שיעורים אמיתיים (לא מצב שגיאה)
- [ ] אין גלישה אופקית ב-390px

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

### Design Tokens — כל האתר (רידיזיין 2026-08-01, הורחב 2026-08-02)
מקור: חבילת ההנדאוף `design_handoff_steps_homepage` שאור עיצב ב-Claude Design.
**כל ארבעת הדפים** (`index.html` + `pilates.html` / `gym-women.html` / `barre.html`)
על אותם טוקנים. `privacy.html` / `accessibility.html` עדיין על הערכה הישנה.
⚠️ **החוק והנגישות בשלושת דפי ה-SEO בתקן של דף הבית** — עוסק מורשה,
הצהרת נגישות, משיכת הסכמה לעוגיות, מע״מ, גופן מקומי, 0 כשלי ניגודיות.
עדכון עיצובי עתידי לא אמור לבטל את זה.

**דפי ה-SEO: אותו גיליון סגנון בשלושתם.** שמות המחלקות הישנים נשמרו
(`.sec` `.sec-title` `.btn-a` `.foot` …) והוחלפה השפה הוויזואלית בלבד —
ככה הטקסט המשפטי, ה-schema והנגישות לא זזו ממקומם. הגיליון הוא איחוד של
המחלקות של שלושת הדפים, ולכן **שינוי בו צריך להיעשות בשלושתם יחד.**

### דפי התוכן (המדריכים) — `content.css` + `content.js`
ארבעת המדריכים (`pilates-price` / `pilates-or-gym` / `pilates-postpartum` /
`pilates-beginners`) חולקים **קובץ CSS ו-JS חיצוני אחד**, ולא inline כמו
דפי הנחיתה — ארבעה עותקים inline היו מתפצלים בעדכון הראשון. אותם טוקנים
בדיוק, ולכן הם נראים זהים לשאר האתר. **דפי הנחיתה הקיימים לא נגעו.**

הבדל מכוון אחד: **אין בהם חשיפה-בגלילה.** במאמר של 1,500 מילים הבהוב של
כל פסקה מפריע לקריאה, וכל מנגנון שמסתיר טקסט בברירת מחדל הוא עוד דרך
שבה טקסט עלול להישאר בלתי-נראה. אין `.rv` ואין IntersectionObserver.

| Token | Value |
|-------|-------|
| Display font | Heebo 900, letter-spacing -.035em |
| Body font | Assistant 300/600/700/800 |
| ink (רקע) | `#0B0B0B` |
| bone (טקסט/סקשן בהיר) | `#F4F2ED` |
| yellow (CTA · הצבע היחיד) | `#FFD400` |
| WhatsApp | `#25D366` על `#062B14` |
| Section padding | `clamp(44px,7.2vw,104px)` × `clamp(20px,4.2vw,56px)` |
| Max width | 1360px |
| Card radius | 16px (גדול 20px) · כפתור 100px |
| Logo height | navbar `clamp(24px,2.2vw,30px)` |

אין יותר סגול/טורקיז בדף הבית — הצהוב הוא המבטא היחיד.

### כללי אמת בדף הבית (אסור לשבור)
- **מקומות פנויים — אין ולא יהיה בשורת השיעור.** Arbox לא מחזיר כמה מקומות
  תפוסים, רק `max_participants` (גודל הקבוצה). אור הורה להוריד את הבאדג׳
  לגמרי (1/8/26). **אסור להחזיר "נותרו N מקומות"** — אין מאיפה לקחת את N.
  (גודל הקבוצה כן מוזכר בטקסט של חלל הרפורמר, שם הוא נכון ומאומת.)
- **מספר שיעורים בשבוע (הירו):** נספר חי מ-6 קריאות ל-`/api/schedule`.
  אם יום אחד נפל — התא נמחק ולא מוצג מספר חלקי.
- **טופס הלידים → Arbox (חי).** `api/lead.ts` פותח כרטיס מתעניינת אמיתי:
  `source_id 19357` → מופיע ב-Arbox כמקור **`Website`**, עם ההערה
  "הושאר בטופס באתר…". **זה הסימן היחיד והוודאי שליד הגיע מהטופס.**
  ⚠️ אל תבלבל עם המקור **"אתר "** (עם רווח) — אותו המזכירות בוחרות ידנית.
- **ייחוס שאר הכפתורים = הטקסט המוכן.** כל 43 קישורי הוואטסאפ ב-9 דפי
  הלקוחות נושאים "(הגעתי מהאתר)" או נפתחים ב-"היי, הגעתי מהאתר של STEPS".
  ההודעה הראשונה שנכנסת אלינו היא מה שמזהה את המקור — היא נשמרת בלוג של
  הבוט ובשיחה עצמה. **מי שמוסיף/משנה כפתור וואטסאפ חייב לשמור על הסימן**,
  אחרת הליד חוזר להיראות כמו כל "הודעה בוואטסאפ" אורגנית.
  לא נושאים סימן, במכוון: קישור הביטולים, `accessibility.html`, `privacy.html`.

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
| 2026-08-08 | Vercel | steps-site-fw5lg0qtf | **ייחוס: האתר הפסיק להיות בלתי-נראה.** אור שאל על ליד ספציפי ("האם היא הגיעה מהאתר?") ולא הייתה דרך לענות. השורש: **רק הטופס** השאיר עקבה (מקור `Website` ב-Arbox), וכל שאר ה-CTA — שהם רוב התנועה — פתחו וואטסאפ עם הודעה **ריקה או גנרית**, ולכן נחתו ב-Arbox כ"הודעה בוואטסאפ", זהה לחלוטין למי ששמרה את המספר לפני שנתיים (נמדד: 33 כאלה ב-30 יום, אף אחד לא ניתן לייחוס). תוקן: **כל 43 קישורי הוואטסאפ ב-9 דפי הלקוחות** נושאים "(הגעתי מהאתר)", ומי שהיה חשוף לגמרי נפתח ב-"היי, הגעתי מהאתר של STEPS". ⚠️ **באג שנתפס לפני העלייה:** הסבב האוטומטי הוסיף `?text=` גם ל-`var WA` ב-`index.html`, ושתי הקריאות שמרכיבות לינק דינמית מוסיפות `?text=` בעצמן — התוצאה הייתה `?text=…?text=…`, כלומר כפתור שבור בכשל מערכת השעות. הוחזר לקישור חשוף והסימן הוזז לתוך המחרוזות עצמן. במכוון **לא** סומנו: קישור מדיניות הביטולים ב-`barre`, `privacy.html`, `accessibility.html` — שם הפנייה אינה ליד. **אומת חי על הדומיין:** 6 דפים נבדקו, 33/33 קישורים נושאים את הסימן, 0 מקרים של `text=…text=`, והטקסטים פוענחו חזרה לעברית קריאה. בנוסף אומת שהטופס עצמו חי — ליד בדיקה שנשלח ל-`/api/lead` נחת ב-Arbox עם מקור `Website`. ⚠️ **ליד הבדיקה "בדיקה קלוד למחוק" / 050-000-0000 עדיין שם — למחוק.** |
| 2026-08-02 | Vercel | steps-site-75yilz4zb | **תמונה אמיתית לאוריה נעמן בכרטיסי הצוות.** הכרטיס שלה היה היחיד מבין הארבעה שהציג `.coach__ph` — עיגול צהוב עם האות "א" — כלומר האתר החי הצהיר "מנהלת קבלה · מדריכת פילאטיס מכשירים" בלי פרצוף. אור שלח צילום שלה על הבר (3808×5712, ~2MB); נחתך ראש-וכתפיים ל-560×700 (31KB) **בדיוק כמו שלושת האחרים**, כדי שהחיתוך העגול של 64px ינחת על הפנים ולא על הצוואר. מחלקת ה-CSS `.coach__ph` נמחקה — היא הייתה בשימוש יחיד. ⚠️ **בדרך תוקנה טעות מיקום שלי:** בסבב הראשון שמתי את התמונה בגלריה ("ככה זה נראה אצלנו") כמשבצת `tall` בגודל 1000×1500, ואור תיקן שהכוונה הייתה לאנשי הצוות — התמונה ההיא (`barre-oria.jpg`) והמשבצת ירדו, ואומת חי שהיא מחזירה 404 ולא נשארה יתומה. **אומת חי על הדומיין ב-589 וב-390:** ארבעת כרטיסי הצוות מחזירים `img` אמיתי, 0 placeholders, `team-oria.jpg` ב-200 (31KB, 560×700, מוצג 64px), 0 תמונות שבורות, 0 שגיאות קונסול, 0 גלישה אופקית, ושלושת הנתיבים הפנימיים (`ads-board.html` / `ads.html` / `scratch_reviews.txt`) עדיין 404. |
| 2026-08-02 | Vercel | steps-site-e72qwbpix | **`nutrition.html` שוחרר לאוויר** (אור אישר). ירד מ-`.vercelignore` יחד עם `images/nutrition/`, נוסף ל-`sitemap.xml` ול-`llms.txt`, ומדף הבית מגיעים אליו פעמיים — קישור-קו מתחת לכפתור הוואטסאפ במקטע התזונה, ו"ליווי תזונה" בפוטר (הצביע קודם לעוגן `#bina`). **שני דברים נחסמו לפני הפרסום:** (1) מקטע "מהשטח" עוד היה **שלוש מסגרות-מקום** עם הוראות פנימיות ("לטשטש שם ותמונת פרופיל") ו-`[משפט קצר מהשיחה]` מתחת לראשי-תיבות מומצאים — שלושת צילומי המסך מעולם לא הגיעו, ולכן המקטע ירד יחד עם הקישור "תוצאות" בתפריט ועם מחלקות ה-`.ph` המתות; הערה בקוד מסמנת מה להחזיר כשהצילומים מגיעים. (2) `og:image`/`twitter:image` הצביעו ל-`images/nutrition/og.jpg` **שלא היה קיים** — כל שיתוף של הדף היה מציג תצוגה מקדימה ריקה; נחתך 1200×630 מתמונת הארוחה של ההירו. **אומת חי על הדומיין ב-1280 וב-390:** 18/18 תמונות נטענות, 0 שגיאות קונסול, 0 גלישה אופקית, 0 כשלי ניגודיות (216 אלמנטים), כל עוגני הניווט קיימים, תפריט המובייל נפתח ונסגר, הפיקסל של מטא **לא** נטען לפני הסכמה לעוגיות, ושלושת הנתיבים הפנימיים (`ads-board.html` / `ads.html` / `api/ads-performance`) עדיין מחזירים 404. |
| 2026-08-02 | Vercel | steps-site-k6x0heoug | **4 דפי התוכן עלו לאוויר** (`pilates-price` / `pilates-or-gym` / `pilates-postpartum` / `pilates-beginners`) — מיזוג `claude/steppes-site-seo-ai-244f89` ל-main והעלאה מ-`C:\Users\USER\steps-site`. הם חולקים `content.css` + `content.js` חיצוניים (לא inline, כדי שארבעה עותקים לא יתפצלו בעדכון הראשון) ונוספו ל-`sitemap.xml` וללינקים הפנימיים. **⚠️ מה שלא עלה, במכוון:** `nutrition.html` + `images/nutrition/` (18 קבצים, ~2MB) היו לא-מקומיטים בתיקייה הראשית — הם מוקאפ שממתין לאישור אור. `.vercelignore` כבר חסם אותם מהדיפלוי הקודם, ולכן המיזוג לא שינה את זה: **הכלל חי בגיט, לא בתיקייה**, ולכן הוא שורד כל מיזוג. גם `redressal-draft-kiryat-hasharon.md` (תפוס ע"י `*.md`) ו-`scratch_reviews.txt` נשארו בחוץ. **אומת חי אחרי ההעלאה:** `nutrition.html` + שתי תמונות מתוך `images/nutrition/` + הטיוטה + `scratch_reviews.txt` + שלושת נתיבי הדשבורד הפנימי — כולם 404. 17 נתיבי לקוחות ב-200. `sitemap.xml` מכיל 10 כתובות, אף אחת מהן לא nutrition. ארבעת דפי התוכן נטענים עם `content.css` חיצוני, רקע `#0B0B0B`, 0 תמונות שבורות, 0 גלישה אופקית (גם ב-390). דף הבית טוען שיעורים אמיתיים מ-Arbox (07:30 GYM אור סבוני · 17:00 GYM פז רומנו ל-3.8) ו-0 שגיאות קונסול. |
| 2026-08-02 | Vercel | steps-site-ok3e5wel8 | **SEO: איחוד הזהות + קישוריות פנימית + llms.txt.** נמדד חי שהאתר מדורג על שם המותג אבל **לא** על "פילאטיס מכשירים נתניה" / "חדר כושר לנשים נתניה" — שם מופיעים Stay Fit, הדס ליפשיץ ומיכל ארווץ. השורש אינו איכות האתר אלא **ארבע ישויות STEPS חיות בו-זמנית** (פולג · כרטיס קריית השרון שנמכר · FreeFit · ספריות), שמפצלות את החוזק בין ארבעה כרטיסים חלשים. תוקן: (1) `sameAs` ב-HealthClub של כל 4 הדפים → אינסטגרם + פייסבוק + `place_id` של פולג `ChIJX3typn8_HRURJ4xZd-KWQQU`; (2) `barre.html` ו-`pilates.html` שלחו GYM/פילאטיס לעוגן `#spaces` בדף הבית במקום לדף הייעודי — שלושת דפי ה-SEO מקשרים עכשיו אחד לשני (לדף הבית הם קישרו מלכתחילה, בכתובת מלאה); (3) `llms.txt` חדש, כולל הצהרה ש-STEPS = פולג בלבד כדי ש-AI לא יקרא את כרטיס קריית השרון כסניף שני. **אומת חי:** JSON-LD תקין עם 3 `sameAs` בארבעת הדפים, `llms.txt` ב-200, שלושת דפי ה-SEO מקשרים לשני האחים ולדף הבית, 8 דפי לקוחות ב-200, ו-`nutrition.html` / `scratch_reviews.txt` / `ads*.html` ב-404. ⚠️ נחסם בדרך: `scratch_reviews.txt` (57KB דאמפ SERP מסשן קודם) היה עולה לדומיין, כי `.vercelignore` חוסם `*.md` ולא `.txt` — נחסם בשם ולא בתבנית, כי `llms.txt` חייב לעלות. ⚠️ **`vercel --prod` מתוך worktree יוצר פרויקט Vercel חדש** (אין `.vercel`, הוא ב-gitignore) — קרה, הפרויקט `gracious-bohr-fa745b` הוסר. להעלות תמיד מ-`C:\Users\USER\steps-site`. |
| 2026-08-02 | Vercel | steps-site-9qb54xka8 | **הדיפלוי הראשון מ-main אחרי המיזוג — ובדרך נחסמה דליפה.** ב-main יש שלושה קבצים פנימיים שהאתר החי מעולם לא הכיל, כי הדיפלוי הקודם עלה מהענף שמחק אותם: `ads-board.html` (**תקציב הפרסום של STEPS קשיח בתוך ה-HTML — ₪3,751 / ₪3,011 / עלות לליד — בלי שום הגנה, רק `noindex`**), `ads.html` ו-`api/ads-performance.ts`. כל העלאה מ-main הייתה מפרסמת אותם על הדומיין של הלקוחות. נוספו ל-`.vercelignore`. בנוסף, שער ההרשאה של ה-API היה `if (token && key !== token)` — כלומר **אם `DASHBOARD_TOKEN` נמחק מ-Vercel, הבדיקה נדלגת לגמרי** וההוצאה על מודעות + ייחוס Arbox נמסרים לכל אחד עם `Access-Control-Allow-Origin: *`. הוחלף ל-fail-closed. **אומת חי אחרי ההעלאה:** שלושת הנתיבים הפנימיים מחזירים 404, ששת דפי הלקוחות + sitemap + `/api/schedule` מחזירים 200, דף הבית טוען שיעורים אמיתיים מ-Arbox, 0 שגיאות קונסול, 0 גלישה אופקית. |
| 2026-08-02 | Vercel | steps-site-94fe46g3e | **הוסרה מערכת השעות המזויפת** מ-`barre.html` ומ-`gym-women.html`. שני הדפים החזיקו מערך `FALLBACK` קשיח (4 שיעורים עם שמות מדריכות) שהוצג גם כשה-API נפל **וגם כשהיום פשוט ריק משיעורי בר/GYM** — כלומר מתאמנת יכלה לראות "18:00 GYM & RUN, אור סבוני" בלי שיש שיעור כזה. הוחלף בדפוס של `pilates.html`: כישלון API → "מערכת השעות נטענת. לקביעת שיעור — דברי איתנו בוואטסאפ"; יום ריק → "אין שיעורי בר/GYM ביום זה". **אומת חי:** שני הדפים טוענים שיעורים אמיתיים מ-Arbox, והדמיית נפילת `fetch` מציגה את הודעת הוואטסאפ ולא נתונים מומצאים. |
| 2026-08-02 | Vercel | steps-site-xn0mm3usl | **שלושת דפי ה-SEO עברו לערכת העיצוב של דף הבית** (ink `#0B0B0B` / bone `#F4F2ED` / צהוב `#FFD400` יחיד, Heebo 900 לכותרות + Assistant לגוף). ירדו: טורקיז `#2EC4B6`, סגול, `#F5C518`, `#FFB800`. Assistant התווסף כגופן מקומי עם preload (היה Heebo בלבד). מקטע השעות עבר מרקע בהיר לכהה — משם הגיעו כשלי הניגודיות של 2/8. AOS מ-cdnjs הוסר (2 בקשות לשרת חיצוני לפני הסכמה לעוגיות) והוחלף בחשיפה-בגלילה מקומית של 12 שורות. תוקן `.n-links a:last-child` שמירכז את **כל** קישורי תפריט המובייל. נוסף `role="img"` לדירוגי הכוכבים ו-`aria-label` לאייקוני הרשתות ב-barre. **אומת חי בדפדפן ב-1280 וב-390:** 0 כשלי ניגודיות (256/183/145 אלמנטים), 0 גלישה אופקית, מערכת שעות טוענת שיעורים אמיתיים מ-Arbox בשלושתם, משיכת ההסכמה לעוגיות מוחקת את הבחירה וטוענת מחדש בלי הפיקסל. |
| 2026-08-02 | Vercel | steps-site-a42zyhf5s | **שלושת דפי ה-SEO הועלו לתקן של דף הבית** (`pilates.html` / `gym-women.html` / `barre.html`). חוק: עוסק מורשה 558306098 בפוטר, קישור ל-`accessibility.html` (בפוטר ובמודאל), קישור למדיניות הביטולים המלאה, כפתור "הגדרות עוגיות" למשיכת הסכמה (תיקון 13 — אומת חי: מוחק את הבחירה, טוען מחדש בלי הפיקסל ומחזיר את הבאנר), "כולל מע״מ" במחירים. פרטיות: Heebo עבר לאירוח עצמי — Google Fonts שלח את ה-IP של הגולשת לגוגל לפני שנשאלה על עוגיות. נגישות: **0 כשלי ניגודיות בשלושת הדפים** (נמדד בדפדפן) — פוטר `#666`/`rgba(...,.15)` על שחור (3.5:1 ו-1.5:1), ב-barre כפתורים/טאבים/skip-link עם טקסט לבן על צהוב (1.63:1), מקטע השעות הבהיר החזיק צבעים של רקע כהה, ופאנל ההזמנה ב-pilates/gym-women עוד היה המסגרת הלבנה של ה-iframe שהוסר (טקסט לבן בלתי-נראה). המודאל כולל עכשיו נגישות פיזית (חניה/מעלית/שירותים). |
| 2026-08-02 | Vercel | dpl_2sVnM3MwkU6YQC5GXfZmjgA4vQQb | **אבטחה + עמידה בחוק.** אבטחה: ולידציה ל-`date` ב-`api/schedule.ts` (היה ניתן להזריק `to_date` ולמשוך טווח שרירותי — אומת חי: 132 פריטים במקום 21), הגבלת קצב ל-`api/lead.ts` (5/10 דק' — מנע הצפת CRM), כותרות אבטחה ב-`vercel.json` (CSP frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy), הפסקת דליפת שגיאות פנימיות. חוק: `accessibility.html` חדש (תקנה 35 — כולל נגישות פיזית: חניית נכים/מעלית/שירותי נכים), כפתור "הגדרות עוגיות" למשיכת הסכמה (תיקון 13), הודעת יידוע בטופס הלידים, עוסק מורשה 558306098 בפוטר, "כולל מע״מ" במחירים, קישור ביטולים→המדיניות המלאה, privacy.html: הסרת Google Fonts + noindex. נגישות: ניגודיות placeholder 3.57→5.89, `role="img"` לכוכבים, skip-link→`#top`, תיקון ניגודיות בפוטר/תאריך של privacy. **0 כשלי ניגודיות ב-3 הדפים (נסרק אוטומטית).** |
| 2026-08-01 | Vercel | dpl_5E6NaN12jq5mwd4vsqfShp9UXAdY | **רידיזיין דף הבית** מחבילת ההנדאוף של Claude Design. מערכת ויזואלית חדשה (ink/bone/#FFD400, Heebo+Assistant), 17 מקטעים, מערכת שעות חיה עם סינון חלל + 8 שורות וכפתור "לכל השיעורים", תפריט מובייל, טופס ליד→וואטסאפ. ⚠️ הועלה מ-worktree `build-designed-website-e50334`, **לא מ-`C:\Users\USER\steps-site`** — ראה אזהרה למטה. |
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
