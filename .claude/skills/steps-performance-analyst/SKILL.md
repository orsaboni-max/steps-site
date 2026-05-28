---
name: steps-performance-analyst
description: >-
  Use when analyzing Meta ad campaign performance for STEPS Fitness — diagnose
  what's working, what's failing, and recommend kill/scale/refresh actions.
  Reads Ads Manager screenshots or live API pulls. Includes Breakdown Effect
  framework, Learning Phase diagnosis, creative fatigue detection, and STEPS-
  specific baselines. Triggers: ניתוח קמפיין סטפס, איך הקמפיין מתפקד, מה לעשות
  עם הקמפיין, screenshot של Ads Manager, אופטימיזציה, performance analysis,
  CPL גבוה, frequency גבוה.
---

# STEPS Performance Analyst — אבחון וחיזוק תוך כדי

הסקיל הזה הוא ה"רופא" של הקמפיינים. כשאור מראה לי screenshot מ-Ads Manager או כשאני מושך נתונים דרך הטוקן המקומי — הסקיל הזה מאבחן ומציע פעולות קונקרטיות.

## קודם תקרא (חובה)
1. `marketing/STATUS.md` — מה רץ עכשיו (קמפיין IDs, תקציבים, סטטוס).
2. `marketing/meta-playbook.md` — סעיפים: **Learning Phase**, **Frequency & Fatigue**, **Bidding**, **Attribution**.
3. `marketing/reports/baseline-2026-05.md` — בייסליין סוכנות לניצחון: **₪30/ליד טופס, ₪10.5/שיחה CTWA**.
4. סקיל גלובלי `meta-ads-analyzer` — 9 מסמכים רשמיים של Meta כולל **Breakdown Effect**.

## 🩺 6 שלבי האבחון (סדר חובה)

### שלב 1: איסוף נתונים
מאיפה הנתונים מגיעים?
- **Screenshot מ-Ads Manager** של אור → לקרוא ידנית כל מספר, לרשום בטבלה.
- **טוקן Meta מקומי** (`C:\Users\USER\meta-token-temp.txt`) → לפנות ל-Graph API. **לעולם לא להדפיס את הטוקן.**
- חלון זמן ברירת מחדל: **7 ימים אחרונים** (לא יותר קצר — תנודות יומיות יבלבלו).

נתונים מינימליים שחייבים:
- Spend (₪)
- Impressions
- Reach
- Frequency
- CTR
- Conversions (שיחות / לידים / רכישות)
- CPA (cost per action)
- Status (Active / Learning / Learning Limited / Off)

### שלב 2: השוואה לבייסליין (האם הקמפיין מנצח?)
| מדד | יעד STEPS | חורג? |
|---|---|---|
| CPA CTWA | ≤₪10.5/שיחה | אם מעל ₪15 — סימן אדום |
| CPA לידים | ≤₪30/ליד | אם מעל ₪40 — סימן אדום |
| CTR | ≥1.5% (קמפייני STEPS עברו 2.47%) | אם <1% — קריאייטיב חלש |
| Frequency 7d | <2.5 | אם >2.5 → fatigue מתחיל; >3.0 → ירידה ודאית |

### שלב 3: בדיקת Learning Phase
- **Learning** = רגיל בימים הראשונים. אל תיגע.
- **Learning Limited** = הקמפיין לא משיג 50 המרות/שבוע. **בעיה.** הפתרונות (לפי playbook):
  1. להגדיל תקציב (לפי נוסחת CPA×50/7)
  2. להרחיב קהל (להוסיף interests או להגדיל רדיוס)
  3. לאחד ad sets (פחות פיצול = יותר נתונים לכל אחד)
- **שינוי בקמפיין באמצע** = איפוס Learning Phase. **תזהיר את אור** לפני כל שינוי שאינו תקציב (תקציב +/-20% לא מאפס).

### שלב 4: זיהוי Creative Fatigue
- **CTR יורד יותר מ-20% תוך 14 יום** = fatigue. צריך קריאייטיב טרי.
- **Frequency 7d > 2.5** = אותם אנשים רואים יותר מדי. צריך וריאציה.
- **5+ creatives פעילים ב-ad set** = הסיכוי לרענון תורן יורד. שקול לכבות את המפסידים.
- פעולה: השק 2-3 וריאציות חדשות (סקיל `steps-reel-pipeline` / `steps-studio-visuals`), הזרם אליהן הדרגתית.

### שלב 5: עדשת Breakdown Effect (חשוב!)
**זה המקום שרוב הסוכנויות טועות בו.**
- אם רואים ad set אחד עם CPA "גרוע" — **אל למהר לכבות אותו.**
- Meta מקצה תקציב לסגמנט "יקר" כדי לפתוח אינוונטר חדש שיהפוך לרווחי.
- **בדוק את התקציב הכולל של הקמפיין** (CBO) — אם הקמפיין כמכלול מנצח, ה-ad set ה"יקר" כנראה תורם.
- חוק: **אל תכבה ad set על סמך 3 ימים ופחות מ-20 המרות.** רעש סטטיסטי.
- ראה `meta-ads-analyzer/breakdown_effect.md` להעמקה.

### שלב 6: המלצות פעולה (kill / scale / refresh / hold)
לכל קמפיין/ad set, התווית אחת מ-4 הקטגוריות:

| תווית | מתי | פעולה |
|---|---|---|
| 🟢 **SCALE** | CPA <60% מהבייסליין, Frequency <2.0, 50+ המרות | להעלות תקציב ב-**20% בלבד** (לא יותר — איפוס Learning). חזור בעוד שבוע. |
| 🟡 **HOLD** | CPA בטווח 80-120% מהבייסליין, יציב | לא לגעת. לבדוק שוב בעוד שבוע. |
| 🟠 **REFRESH** | Frequency >2.5 או CTR ירד >20% | הזרם וריאציות חדשות של קריאייטיב (לא לכבות עדיין). |
| 🔴 **KILL** | CPA >150% מהבייסליין **ו** 50+ המרות **ו** 14+ יום ריצה | לכבות ad set / ad. **לעולם לא לפני 50 המרות.** |

## 📦 פלט סופי (חובה)
1. צור `marketing/reports/weekly-YYYY-MM-DD.md` עם:
   - טבלת קמפיינים: spend, conversions, CPA, frequency, CTR, status, תווית פעולה
   - 3 שורות הסבר בעברית פשוטה לאור (מה עובד, מה לא, מה לעשות)
   - **המלצה אחת מובילה לשבוע** (לא 10 — אחת)
2. עדכן `marketing/STATUS.md` אם משהו שונה ב-7 ימים.
3. אם המלצה לפעולה (kill/scale/refresh) — **חכה לאישור מפורש של אור לפני ביצוע ב-Meta.**

## ⛔ איסורים מוחלטים
- אסור לכבות ad set עם פחות מ-50 המרות (אפילו אם CPA גבוה — זה רעש).
- אסור להעלות תקציב יותר מ-20% בכל פעם (איפוס Learning).
- אסור להשוות חלון של פחות מ-7 ימים לבייסליין (יומי = רעש).
- אסור לבצע פעולה ב-Meta בלי אישור מפורש של אור.
- אסור להדפיס את הטוקן של Meta בשום אופן (גם לא הסוף שלו).
- אסור להמליץ על שינוי טרגוט בקמפיין פעיל בלי לציין "זה יאפס את שלב הלמידה — בטוח?"

## 🎯 הכלל הזהב של אבחון STEPS
**המדד היחיד שמעניין באמת = לקוחה חדשה ב-Arbox.** שיחה ≠ לקוחה. ליד ≠ לקוחה.
לכן: לפני סגירת אבחון, להצליב עם Arbox MCP (`new_members` ב-7 ימים) — כמה שיחות/לידים הפכו למתאמנות בפועל? זה ה-CPA האמיתי.
