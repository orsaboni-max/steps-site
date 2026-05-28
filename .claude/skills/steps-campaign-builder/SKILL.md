---
name: steps-campaign-builder
description: >-
  Use when launching a NEW Meta ad campaign for STEPS Fitness — from idea to live.
  Covers objective selection, audience definition, budget formula, placements,
  campaign structure, naming, and approval gate. Hebrew/Israeli market, women's
  fitness studio context. Triggers: קמפיין חדש סטפס, להקים קמפיין, מבנה קמפיין,
  קהל יעד סטפס, תקציב קמפיין, launch campaign STEPS, new campaign.
---

# STEPS Campaign Builder — מהרעיון לאוויר

הסקיל הזה מפעיל את הידע של "בונה קמפיינים" — כשאור אומר "בוא נקים קמפיין חדש ל-X", הסקיל הזה הוא הצ'קליסט.

## קודם תקרא (חובה)
1. `marketing/STATUS.md` — מה כבר רץ (להימנע מ-audience overlap).
2. `marketing/meta-playbook.md` — סעיפי **Bidding & Budget** + **CTWA Best Practices** + **Learning Phase**.
3. `marketing/brand/brand-dna.md` — קהלים, טון, איסורים.
4. `marketing/research/competitor-research.md` — מה עובד מקומית.
5. `marketing/ops/meta-launch-spec.md` — מבנה טכני סטנדרטי.

## ⚙️ 8 שלבי הקמת קמפיין (לפי הסדר, אסור לדלג)

### שלב 1: הגדרת מטרה עסקית (לא טכנית)
- מה אור רוצה להשיג? (יותר מתאמנות לקבוצה X / מילוי שיעור Y / השקה של חוג חדש)
- **KPI יחיד** — מה המספר שמודד הצלחה? (לקוחה חדשה ב-Arbox / שיחת WhatsApp / רישום לאימון היכרות)
- בייסליין: ₪10.5/שיחה (CTWA) או ₪30/ליד (טופס) — לפי `marketing/reports/baseline-2026-05.md`.

### שלב 2: בחירת objective
| המטרה | Objective | למה |
|---|---|---|
| שיחות וואטסאפ → מתאמנת | **OUTCOME_ENGAGEMENT** + destination WHATSAPP | הזרם המוכח של STEPS (₪10.5/שיחה) |
| לידים בטופס → Arbox | OUTCOME_LEADS + Instant Form | רק אחרי שה-Lead Gen ToS אושר ע"י Upgrade 360 |
| מודעוּת (קמפיין מותג/השקה) | OUTCOME_AWARENESS | רק אם יש סיבה אסטרטגית — אחרת לא לבזבז תקציב |

**ברירת מחדל ל-STEPS: CTWA.** אל תציע אחרת בלי סיבה.

### שלב 3: קהל יעד (audience)
- **גיאוגרפיה:** רדיוס מ-3 ק"מ (סקפטי-מומחה) עד 12 ק"מ (רחב). מרכז: **lat 32.29047 / long 34.857142** (סטודיו STEPS פולג).
  - פילאטיס/נישתי → 3-5 ק"מ
  - חוג רחב/מבצע השקה → 7-12 ק"מ
- **גיל + מין:** 
  - מבוגרות: נשים 25-55
  - הורים (KIDS): 33-55 (שני המינים)
  - **קטינים 13-17:** Meta אוסרת בקמפייני המרה/CTWA — רק awareness נפרד אם בכלל.
- **תחומי עניין:** פילאטיס, יוגה, כושר, אורח חיים בריא, אמהוּת. **אל תפיל מעל 3 interests** — Meta ממליצה רחב.
- **Advantage+ Audience:** **לא להפעיל בקמפיינים <₪50/יום או <50 המרות/שבוע** (לפי playbook).

### שלב 4: תקציב (נוסחת Meta — חובה לחשב, לא לנחש)
**נוסחה: (CPA יעד × 50) ÷ 7 = תקציב יומי מינימלי**

דוגמאות ל-STEPS:
| CPA יעד | תקציב יומי מינ' | למה |
|---|---|---|
| ₪10.5/שיחה (בייסליין CTWA) | ₪75/יום | להגיע ל-50 שיחות בשבוע = יציאה משלב למידה |
| ₪30/ליד טופס | ₪215/יום | אם רוצים קמפיין טופס — צריך תקציב רציני |
| ₪50/לקוחה אמיתית | ₪357/יום | האידאל לטווח ארוך |

**מציאות STEPS:** הקמפיינים החיים על ₪50/יום = מתחת למינימום. **תזהיר את אור** — או להעלות תקציב, או לקבל ש-Learning Phase לא תיגמר ויהיו תנודות.

### שלב 5: Bidding strategy
- **ברירת מחדל: Lowest Cost (LOWEST_COST_WITHOUT_CAP)** — Meta מוצאת את ההמרה הזולה ביותר.
- Cost Cap: רק אחרי 2 חודשים של ביצועים יציבים + יודעים את הCPA האמיתי.
- Bid Cap: כמעט אף פעם — דורש מומחיות גבוהה ומסכן את ההגשה.

### שלב 6: Placements
- **ברירת מחדל: Advantage+ Placements (אוטומטי).** Meta מחלקת בין Feed/Reels/Stories לפי ביצועים.
- אם הקריאייטיב **רילז (וידאו אנכי 9:16)** — Reels הוא ה-placement שיתפוס רוב התקציב, וזה טוב.
- אם תמונה סטטית — Feed יתפוס. **שקול לייצר גם וריאציה לרילז** כדי לפתוח לעוד placements.

### שלב 7: מבנה הקמפיין (CBO vs ABO)
- **CBO (Campaign Budget Optimization):** תקציב ברמת קמפיין, Meta מחלקת בין ad sets. **ברירת מחדל ל-STEPS** — פשוט, פחות נגיעות.
- **ABO (Ad Set Budget):** תקציב לכל ad set. רק כשבודקים קהלים שונים בדיוק אותו תקציב.
- **כמות ad sets:** 1-3 לקמפיין (יותר → audience overlap → cannibalization, ראה Auction Overlap בפלייבוק).

### שלב 8: שמות, קריאייטיב, ואישור
- **שמות:** `[סוג]_[קהל]_[תאריך]` למשל `CTWA_פילאטיס-נערות_2026-05`
- **קריאייטיב:** ייצור ע"י סקיל `steps-ad-copy` (קופי) + `steps-reel-pipeline` (וידאו) + `steps-studio-visuals` (תמונות).
- **לפני בנייה ב-Meta:** הצג לאור:
  1. מטרה + KPI
  2. קהל מדויק (גיל, רדיוס, מין)
  3. תקציב יומי + total cap
  4. Bidding
  5. Placements
  6. קריאייטיב מאושר
- **אסור לבנות ב-Meta בלי "אישור פרמטרים" של אור.**
- **כל הקמפיינים נשארים PAUSED עד אישור "go" סופי.**

## 📦 פלט סופי (חובה)
1. צור `marketing/campaigns/[campaign-name].md` עם כל הפרמטרים מ-8 השלבים.
2. עדכן `marketing/STATUS.md` בטבלת הקמפיינים החיים (אם עלה לאוויר).
3. הוסף שורה ל-`marketing/campaigns/launch-log.md` עם תאריך + IDs.

## ⛔ איסורים מוחלטים
- אסור לבנות קמפיין בלי אישור פרמטרים של אור.
- אסור להגדיר תקציב מעל מה שאור אישר במפורש.
- אסור למקד מתחת לגיל 18 בקמפייני המרה.
- אסור לשנות interests/קהל אחרי שקמפיין נכנס לשלב למידה (Learning Phase reset = איפוס הביצועים).
- אסור להריץ קמפיין על קופי שאור לא אישר (סקיל `steps-ad-copy` הוא המקור).
