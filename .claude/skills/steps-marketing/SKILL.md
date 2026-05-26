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

## קודם תקרא
- `marketing/brand/brand-dna.md` — מותג, טון, ויזואל, קהלים.
- `marketing/ops/connections-map.md` — חשבונות, חיבורים, מגבלות (אמת מחדש — משתנה).

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

## עובדות מפתח (אמת מול connections-map)
- **חשבון Meta לעבודה:** 335981596 (STEPS, USD, נשלט דרך MCP). שאר החשבונות לא נגישים.
- **Pixel:** 1016773848190436. **CTA מנצח:** Click-to-WhatsApp.
- **Make team:** 1034350 — לכידת לידים + Meta CAPI + דוחות (חלק לתיקון).
- מגבלות rollout: Lookalike/creatives/datasets עדיין סגורים בחשבון — לא חוסם v1 (מיקוד אזור+גיל+תחומי עניין).

## קהלי מיקוד (Meta)
- מבוגרות: נשים נתניה+12 ק"מ, 25–55.
- KIDS: הורים 33–55, נתניה+12 ק"מ (custom_location lat 32.30 / long 34.86 / 12km).