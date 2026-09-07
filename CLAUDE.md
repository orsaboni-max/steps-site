# CLAUDE.md — STEPS Fitness Website

> עודכן: 7/9/2026 · היסטוריית העלאות: `docs/DEPLOY-LOG.md` · החלטות ותיעוד: `docs/decisions/` · כללים לפי נתיב: `.claude/rules/`

## הפרויקט
אתר תדמית סטטי ל-STEPS Fitness — סטודיו כושר לנשים בנתניה (**פולג בלבד**, קריית השרון נמכר). 3 חללים: GYM · MOVE · REFORMER PILATES.
בעלים: אור סבוני + אור תורג'מן. ~500 מתאמנות. HTML/CSS/JS ללא build; API Routes של Vercel ב-`api/`.

לפני כל משימת קוד: `.claude/skills/code-mastery/SKILL.md` (שיטת העבודה) + `~/.claude/skills/steps-website/SKILL.md`. דף SEO חדש: `~/.claude/skills/seo-landing-page-hebrew/SKILL.md`.

## מבנה
```
index.html              דף הבית
pilates/gym-women/barre/kids.html   דפי נחיתה (CSS inline, גיליון זהה בשלושת הראשונים)
pilates-*.html          4 מדריכים — חולקים content.css + content.js
nutrition.html          דף התזונה (inline) · images/nutrition/
api/                    schedule.ts (Arbox → /api/schedule) · lead.ts (טופס → Arbox)
images/                 צילומי הסטודיו
tests/                  node --test
docs/                   DEPLOY-LOG.md · decisions/
```

## פקודות
```bash
node --test tests/website.test.mjs api/lead.test.mjs   # 17 בדיקות. Stop hook חוסם סיום אם נכשלות
```
```bash
cd C:\Users\USER\steps-site && npx vercel --yes --prod   # deploy — רק מהתיקייה הראשית
```
⚠️ **להעלות רק מ-`C:\Users\USER\steps-site`, לא מ-worktree.** `vercel --prod` מ-worktree יוצר פרויקט Vercel חדש (קרה 2/8/26).
לפני העלאה: `grep -c FFD400 index.html` חייב להחזיר 1 — אם 0, זו התיקייה הלא נכונה.

## כללי אמת בדף הבית (אסור לשבור)
- **מקומות פנויים — אין ולא יהיה.** Arbox מחזיר רק `max_participants`, לא תפוסה. אסור "נותרו N מקומות" (אור, 1/8/26).
- **מספר שיעורים בשבוע (הירו)** נספר חי מ-6 קריאות ל-`/api/schedule`. יום שנפל → התא נמחק, לא מספר חלקי.
- **טופס הלידים → Arbox חי.** `source_id 19357` = מקור **`Website`** — הסימן היחיד שליד הגיע מהטופס. "אתר " (עם רווח) = מקור ידני של המזכירות.
- **כל קישור וואטסאפ נושא "(הגעתי מהאתר)"** או נפתח ב-"היי, הגעתי מהאתר של STEPS". זה הייחוס של כל CTA שאינו הטופס. חריגים במכוון: קישור הביטולים, `accessibility.html`, `privacy.html`.
- `lead_form_submit` ו-Meta `Lead` נשלחים פעם אחת, רק אחרי הצלחת הטופס. קליק וואטסאפ/Arbox = אירוע נפרד, לא ליד.
- אין מערכת שעות מזויפת: כשל API → הודעת "דברי איתנו בוואטסאפ"; יום ריק → "אין שיעורים ביום זה".

## עובדות מאושרות — קבוצות הנוער (אור, 5/9/26)
- שלוש פעילויות נפרדות, כולן גילאי **12–15**, אימון היכרות **50 ₪** בכל אחת.
- כוח לילדים ולנוער: ראשון וחמישי 17:00, שלישי 16:30, 50–60 דק'. פילאטיס מכשירים לנערות: ראשון 16:00, רביעי 17:00. בר לנערות: ראשון 16:00.
- לא אושרו: משך פילאטיס/בר, מחירי מנויי נוער, גודל קבוצה — מפנים לצוות. שעות סטודיו: שישי 07:30–13:00; מוצ"ש לפי המערכת בלבד.

## צ'קליסט לפני העלאה
- [ ] 17 הבדיקות עוברות · לוגו בניווט · `id="team"` = 1 · "אתם הלב שלי" (עדויות = ביקורות גוגל אמיתיות) · `burger` · `og:title`
- [ ] וואטסאפ 972527927575 · עברית, לשון נקבה · אין `text=…text=` כפול
- [ ] מערכת השעות טוענת שיעורים אמיתיים · אין גלישה אופקית ב-390px · 0 כשלי ניגודיות · RTL תקין
- [ ] לא נמחקו מקטעים קיימים · דף חדש נוסף ל-`sitemap.xml` + `llms.txt`
- [ ] קבצים פנימיים לא עולים (`.vercelignore`): `ads-board.html` `ads.html` `api/ads-performance.ts` `nutrition-v3.html`
- [ ] אחרי העלאה: אימות חי על הדומיין + שורה חדשה ב-`docs/DEPLOY-LOG.md`
- [ ] **QA בעיניים, לא רק מספרים (לקח 7/9/26):** לפתוח כל דף ששונה בטאב פעיל וגלוי (390 + 1280) ולראות: אנימציות זזות, וידאו מתנגן, לוח שעות נטען, תפריט נפתח. מדידה בטאב מוסתר מקפיאה אנימציות ומטעה. אור תפס פס רץ "קפוא" שהאוטומציה החמיצה.

## Design Tokens — כל האתר (רידיזיין 1/8/26)
מקור: חבילת ההנדאוף `design_handoff_steps_homepage` מ-Claude Design. הצהוב הוא המבטא היחיד — אין סגול/טורקיז.

| Token | Value |
|-------|-------|
| Display font | Heebo 900, letter-spacing -.035em |
| Body font | Assistant 300/600/700/800 |
| ink (רקע) | `#0B0B0B` |
| bone (טקסט/סקשן בהיר) | `#F4F2ED` |
| yellow (CTA) | `#FFD400` |
| WhatsApp | `#25D366` על `#062B14` |
| Section padding | `clamp(44px,7.2vw,104px)` × `clamp(20px,4.2vw,56px)` |
| Max width | 1360px |
| Card radius | 16px (גדול 20px) · כפתור 100px |
| Logo height | navbar `clamp(24px,2.2vw,30px)` |

גופנים באירוח עצמי (לא Google Fonts — פרטיות). שלושת דפי ה-SEO חולקים גיליון זהה — שינוי בו נעשה בשלושתם יחד.
המדריכים: `content.css` בלי חשיפה-בגלילה. `privacy.html` / `accessibility.html` עדיין על הערכה הישנה.

## תשתית
- **Vercel:** פרויקט `steps-site` · דומיין `stepsnetanya.co.il` · env `ARBOX_API_KEY` · כותרות אבטחה והפניות ב-`vercel.json`.
- **Arbox:** `/api/schedule?date=YYYY-MM-DD` → v3 schedule, סינון `location_name` מכיל "פולג", cache 5 דק'.
- **GitHub:** `orsaboni-max/steps-site`, ענף `main`. Netlify לא בשימוש.
- **מדידה:** GA4 `G-5T22VE9YHT` · Meta Pixel `1016773848190436` — נטענים רק אחרי הסכמה לעוגיות.
- **חוק ונגישות:** עוסק מורשה 558306098 בפוטר · "כולל מע״מ" במחירים · `accessibility.html` · כפתור "הגדרות עוגיות" למשיכת הסכמה.
- Search Console מאומת דרך `googlef1ad3263d396966f.html` — לא למחוק.

## 🗺️ תוכנית צמיחה (SEO · GEO · המרה · ויזואל) — אושרה 7/9/2026
- קובץ התוכנית: `C:/Users/USER/.claude/plans/flickering-cuddling-catmull.md` (נספח טכני עם מצביעי שורות). זיכרון: `project_steps_site_growth_plan_2026-09-07.md`.
- סדר סשנים: R0 (קציר ביקורות — בוצע 7/9, קובץ `C:/Users/USER/steps-site-audit-2026-09-05/reviews-shortlist-2026-09-07.md`) → S1 · S2 · S3 — **בוצעו ומוזגו 7/9/2026** (פירוט: `docs/decisions/2026-09-07-growth-s1-s3.md`) → RV1 ביקורת+דיפלוי #1 → S4 תוכן → S5 ויזואל Higgsfield → RV2 → מדידה יום 30/60/90.
- החלטות אור 7/9: בר "עד 15" נשאר, GYM בלי מספר · "קורס הבר של טלי"/"למעלה מ-25 מאמנות"/"מוסמכים" נשארים · "99 ₪ לחודש" יורד מהתזונה · "אחרי לידה" = מידע כללי מאור סבוני · תמונת פתיחת הילדים = AI → כיתוב · הפתיח נשאר, רק חידוד Topaz 1080p.
- ⚠️ הפתיח בדף הבית נוצר ב-AI מצילום סטילס (commit 6b0b878). ההמלצות הקיימות בבית/GYM/פילאטיס נושאות שמות מומצאים — מוחלפות בביקורות גוגל מילה במילה (S1/S3).
- דיפלוי: התיקייה הראשית `C:/Users/USER/steps-site` עומדת על הענף `codex/site-audit-fixes` (זהה ל-main ב-5d759cc, בלי שינויים) — לפני `npx vercel --yes --prod` לעשות שם `git checkout main && git pull`.
