---
name: steps-marketing
description: >-
  Use when working on STEPS Fitness paid advertising or marketing campaigns —
  Meta/Google ads, ad creative, lead routing, or reporting. Covers the brand,
  the connected accounts/automation, the campaign lifecycle, and approval gates.
  Triggers: STEPS ads, קמפיין STEPS, מודעות סטפס, STEPS KIDS, קריאייטיב לסטפס,
  להשיק קמפיין, ניטור מודעות סטפס.
---

# STEPS Marketing

מערכת עבודה לשיווק STEPS Fitness בניהול Claude (החלפת חברת השיווק). מטרה: כמה שיותר אוטומטי ומבוסס-נתונים.

## קודם תקרא (קריאת חובה)
- **`marketing/STATUS.md`** — מה באוויר עכשיו (קמפיינים חיים, IDs, רדיוסים, סטטוס). **המקור היחיד לאמת על המצב הנוכחי.** לעדכן אחרי כל שינוי במציאות.
- **`marketing/meta-playbook.md`** — ידע רשמי של Meta + תובנות 2026 (Learning Phase, CTWA, Reels, bidding, frequency, Advantage+, attribution, lead ads). **לקרוא את הסעיף הרלוונטי לפני כל החלטה.**
- `marketing/brand/brand-dna.md` — מותג, טון, ויזואל, קהלים.
- `marketing/ops/connections-map.md` — חשבונות, חיבורים, מגבלות (אמת מחדש — משתנה).

## 🎭 מפת התפקידים (איזה סקיל לשימוש מתי)
זה הסקיל הראשי — האב. הוא מאגד את ה-3 התפקידים הספציפיים שלמטה. הוא הסקיל שעולה כשאור אומר "שיווק סטפס" באופן כללי. כשהמשימה ספציפית, אחד התפקידים למטה הוא העיקרי:

| תפקיד | מתי הסקיל קופץ | מה הוא עושה |
|---|---|---|
| 🎨 **`steps-ad-copy` + `steps-reel-pipeline` + `steps-studio-visuals`** | כשמייצרים קופי/ריל/תמונה | המקור לכל הקריאייטיב — DNA הקול, נוסחת ההפקה |
| 🛠️ **`steps-campaign-builder`** | כשמקימים קמפיין חדש | צ'קליסט 8 שלבים: objective → audience → budget → bidding → placements → structure → naming → approval |
| 📊 **`steps-performance-analyst`** | כשמנתחים תוצאות / רואים screenshot | 6 שלבי אבחון: data → baseline → Learning Phase → fatigue → Breakdown Effect → kill/scale/refresh |

**שגרות אוטומטיות פעילות:**
- ראשון 09:00 → `steps-marketing-weekly-audit` (audit + צ'קליסט לאור)
- שני 09:00 → `steps-creative-ideas-weekly` (3 רעיונות מהמתחרים)

## 🧠 כלל הזיכרון (חובה — אסור לחקור פעמיים)
**אם חקרת נושא שיווקי חדש (מסמך רשמי של Meta, בלוג מומחה, פיצ'ר חדש) — חייב לשמור מיד ל-`marketing/meta-playbook.md`** (סעיף חדש או הרחבה לסעיף קיים, עם מקור + תאריך + תובנה ספציפית ל-STEPS). אחרת בפעם הבאה תחקור שוב את אותו דבר ותבזבז זמן של אור.
- בדיקה לפני שמתחילים מחקר: האם זה כבר ב-playbook? (חיפוש מילת מפתח)
- אחרי המחקר: לרשום ב-playbook + להזכיר לאור "הוספתי לפלייבוק כדי שלא נחקור שוב".

## 📝 כלל הפידבק (חובה — אסור לחזור על אותה טעות)
**אם אור אומר "לא נכון" / "כבר דיברנו על זה" / "טעית" / "אתה לא מבין" / "אל תעשה ככה" — חייב מיד (באותה שיחה) ליצור/לעדכן קובץ פידבק:**
1. מיקום: `C:\Users\USER\.claude\projects\C--Users-USER-steps-site\memory\feedback_<תיאור-קצר>.md`
2. תוכן: הקשר (מה רציתי לעשות), הטעות, התיקון של אור, **הכלל לעתיד**.
3. להוסיף שורה ל-`memory/MEMORY.md` תחת `## Feedback`.
4. להגיד לאור: "שמרתי את זה לזיכרון קבוע כדי שלא נחזור על הטעות".

קבצי הפידבק נטענים אוטומטית בכל שיחה חדשה דרך SessionStart hook. **זו הדרך היחידה שאתה משתפר.**

## ⛔ כללי ברזל (חובה)
1. **שום דבר לא עולה לאוויר בלי אישור מפורש של אור** — לא מודעה, לא קריאייטיב, לא תקציב.
2. **קריאייטיב = מייצרים → אור מאשר → מעלים.** עוקבים ב-`marketing/creative/creative-status.md`.
3. **אסור ליצור אובייקטים בחשבון המודעות עם תקציב/מיקוד שאור לא אישר במפורש.** מבקשים אישור פרמטרים.
4. הכל נשאר **מושהה** עד go סופי. אישור לפעולה אחת ≠ אישור לכל הפעולות.
5. לפני "מוכן" — אודיט צולב (כל toggle/חיבור באמת עובד).

## תהליך קמפיין (לולאה חוזרת)
1. **מחקר** — מתחרים ב-Meta Ad Library (`ads-competitor`) → `marketing/research/`.
2. **בריף + קופי** — עברית לשון נקבה, מבוסס brand-dna (`ads-create`, `ad-creative`) → `marketing/campaigns/`.
3. **קריאייטיב** — prompts → ייצור (ChatGPT image / Gemini / higgsfield) → `marketing/creative/` → **אישור אור**.
4. **בנייה (עודכן 9/6)** — דרך **Meta Ads MCP (read+write)** בחשבון **9773300439396945 (ILS)**: campaign → ad set → ad. Graph ישיר נדרש רק ליצירת טופס לידים + העלאת תמונה/וידאו. הכל PAUSED. אשר תקציב+מיקוד עם אור לפני יצירה. (335981596 = USD ישן, מושהה.)
5. **השקה** — רק אחרי go סופי של אור.
6. **ניטור** — נתוני מודעות (Meta Ads MCP) + תוצאות אמיתיות מ-Arbox (`new_members`/הרשמות) + GA4. דוח השוואתי.

## עובדות מפתח (אמת מול connections-map ו-STATUS)
- **חשבון Meta לעבודה (עודכן 9/6):** **9773300439396945** (סטפס פיטנס, ILS — של הסוכנות שעבר אלינו). שליטה דרך **Meta Ads MCP (read+write, 3 חשבונות)**; Graph ישיר + System User Token (`C:\Users\USER\meta-token-temp.txt`) נדרש רק ליצירת טופס לידים + העלאת תמונה/וידאו. **לעולם לא להדפיס/לחשוף את הטוקן.** (335981596 = USD ישן, מושהה.)
- **אפליקציית API:** STEPS Ads (965626116111401), Live mode.
- **Pixel:** 1016773848190436. **דף Facebook:** 815909245241691 (STEPS Fitness Center). **IG:** 17841407261641705 (@steps_netanya).
- **CTA מנצח:** Click-to-WhatsApp (972527927575) → Upgrade 360 → Arbox.
- **קליטת לידים (עודכן 9/6):** טופס פעיל 1542048374099477 → **Zapier (Zap 367117682)** → Arbox + הבוט steps-brain (טלגרם + יצירת משימה). CAPI דרך הבוט (steps-brain, Railway). Make.com **אינו** עמוד-השדרה הפעיל לפַּס שלנו.
- **בייסליין סוכנות לניצחון:** CPL ≈ ₪30 (פירוט ב-`marketing/reports/baseline-2026-05.md`).

## קהלי מיקוד (Meta) — סוּכמו ב-STATUS.md
- **פילאטיס נערות (CTWA):** נשים 36-55, רדיוס 3 ק"מ פולג, ₪50/יום.
- **STEPS KIDS 12-15 (CTWA):** גיל 33-55 (הורים), רדיוס 5 ק"מ פולג (custom_location lat 32.29047 / long 34.857142).
- **רוחב נתניה+סביבה (כללי):** עד 12 ק"מ, גיל 25-55, נשים — לקמפיינים חדשים של רכישה רחבה.
- **הגבלה רגולטורית:** Meta אוסרת מיקוד קטינים (13-17) בקמפייני המרה/CTWA — רק קמפיין מודעוּת נפרד אם בכלל.