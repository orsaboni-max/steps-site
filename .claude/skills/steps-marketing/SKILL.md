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

## 🧠 כלל הזיכרון (חובה — אסור לחקור פעמיים)
**אם חקרת נושא שיווקי חדש (מסמך רשמי של Meta, בלוג מומחה, פיצ'ר חדש) — חייב לשמור מיד ל-`marketing/meta-playbook.md`** (סעיף חדש או הרחבה לסעיף קיים, עם מקור + תאריך + תובנה ספציפית ל-STEPS). אחרת בפעם הבאה תחקור שוב את אותו דבר ותבזבז זמן של אור.
- בדיקה לפני שמתחילים מחקר: האם זה כבר ב-playbook? (חיפוש מילת מפתח)
- אחרי המחקר: לרשום ב-playbook + להזכיר לאור "הוספתי לפלייבוק כדי שלא נחקור שוב".

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
4. **בנייה** — דרך פלאגין Meta בחשבון **335981596**: campaign → ad set → ad. הכל PAUSED. אשר תקציב+מיקוד עם אור לפני יצירה.
5. **השקה** — רק אחרי go סופי של אור.
6. **ניטור** — נתוני מודעות (פלאגין) + תוצאות אמיתיות מ-Arbox (`new_members`/הרשמות) + GA4. דוח השוואתי.

## עובדות מפתח (אמת מול connections-map ו-STATUS)
- **חשבון Meta לעבודה:** **9773300439396945** (סטפס פיטנס, ILS — של הסוכנות שעבר אלינו). שליטה מלאה דרך Graph API + System User Token קבוע (`C:\Users\USER\meta-token-temp.txt`). **לעולם לא להדפיס/לחשוף את הטוקן.**
- **אפליקציית API:** STEPS Ads (965626116111401), Live mode.
- **Pixel:** 1016773848190436. **דף Facebook:** 815909245241691 (STEPS Fitness Center). **IG:** 17841407261641705 (@steps_netanya).
- **CTA מנצח:** Click-to-WhatsApp (972527927575) → Upgrade 360 → Arbox.
- **Make team:** 1034350 — לכידת לידים + Meta CAPI + דוחות.
- **בייסליין סוכנות לניצחון:** CPL ≈ ₪30 (פירוט ב-`marketing/reports/baseline-2026-05.md`).

## קהלי מיקוד (Meta) — סוּכמו ב-STATUS.md
- **פילאטיס נערות (CTWA):** נשים 36-55, רדיוס 3 ק"מ פולג, ₪50/יום.
- **STEPS KIDS 12-15 (CTWA):** גיל 33-55 (הורים), רדיוס 5 ק"מ פולג (custom_location lat 32.29047 / long 34.857142).
- **רוחב נתניה+סביבה (כללי):** עד 12 ק"מ, גיל 25-55, נשים — לקמפיינים חדשים של רכישה רחבה.
- **הגבלה רגולטורית:** Meta אוסרת מיקוד קטינים (13-17) בקמפייני המרה/CTWA — רק קמפיין מודעוּת נפרד אם בכלל.