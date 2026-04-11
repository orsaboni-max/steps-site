---
name: command-builder
description: חובה להפעיל SKILL זה לפני כל פקודת Claude Code. בכל פעם שכותבים פקודה להדבקה ב-Claude Code — קודם עוברים על הצ'קליסט. Trigger: כל פעם שאור מבקש פקודה, תיקון, שכתוב, בנייה, הדפסה, או כל דבר שרץ ב-Claude Code. גם אם נראה פשוט. גם אם זו שורה אחת. בלי SKILL הזה — אסור לשלוח פקודה.
---

# Command Builder — צ'קליסט חובה לפני כל פקודה

## שלב 0: זהה פרויקט
**לפני הכל — זהה או שאל: בינה / Steps / MEVO / @orsaboni?**
כל פרויקט יש לו כללים ספציפיים — ראה סקשן "כללים ספציפיים" למטה.

## כלל ברזל
**אף פקודה לא יוצאת בלי שעברתי את כל הסעיפים.**
פקודה עיוורת = אסור. פקודה לא מעודכנת = אסור.

## לפני כל פקודה — הצג את הטבלה הזו:

```
📋 בדיקת פקודה (פרויקט: ___):
[x] 1. /clear — נפרד מהפקודה
[x] 2. קרא CLAUDE.md — תמיד
[x] 2.5. פקודה ראשונה בסשן? → הוסף "הרץ /model opusplan" בתחילת הפקודה (פעם אחת בלבד — לא אחרי כל /clear)
[x] 2.7. בינה? → הוסף "משוך Notion Handoff Doc (32766661-47bc-8182-b1e7-e085e327fb88) + סיכום יומי אחרון" לפני כל שאר הפקודה
[x] 3. קרא SPEC/קבצים — אילו: ___ (השתמש ב-@ להכנסת קבצים ישירות)
[x] 4. קרא skill — אילו: ___ (לפי פרויקט — ראה למטה)
[x] 5. Use sub agents — כן/לא (2+ קבצים = כן, חקירה/ריסרץ' = כן)
[x] 6. Ultrathink — כן/לא (חקירה/לוגיקה = כן)
[x] 7. "מה לא לשנות" — רשימה: ___
[x] 8. בדיקות + אימות עצמי — מה בודקים: ___ (Claude חייב להריץ ולאמת בעצמו)
[x] 9. "הדפס אחרי" — מה מדפיסים: ___
[x] 10. Double check everything
[x] 11. עדכן CLAUDE.md + מפת פרויקט — מה: ___ (לפי פרויקט — ראה למטה)
[x] 12. git push origin main
[x] 13. כלי מתקדם? → Monitor (טסטים/deploy) / /loop (ניטור חוזר) / /ultraplan (תכנון 4+ שלבים)
[x] 14. ניהול קונטקסט: /compact (סיכום בלי מחיקה) / /btw (שאלת צד) / /rewind (חזרה) / /rename (שם לסשן)
```

**אם סעיף ריק — מלא אותו. אם לא רלוונטי — כתוב "לא רלוונטי" ולמה.**

## כלל 2 תיקונים
**אם תיקנת את Claude פעמיים על אותו דבר ועדיין לא עובד — /clear ופרומפט חדש. הקונטקסט מזוהם.**

---

## כללים ספציפיים — בינה (bina-v2)

### סעיפים ספציפיים:
- **סעיף 2.7 (Notion pull):** חובה! משוך Handoff Doc + סיכום יומי אחרון לפני כל פעולה
- **סעיף 4 (skills):** bina-nutrition, frontend-design
- **סעיף 11 (עדכון):** עדכן CLAUDE.md + BINA_FULL_MAP.md

### אימות נוסף:
- אם הפקודה משנה קוד:
  - [ ] ראיתי את הקוד הרלוונטי בשיחה? אם לא → קודם "הדפס בלי לשנות"
  - [ ] "מה לא לשנות" מפורט? אם לא → הוסף
  - [ ] IDs — חפש בקטלוג לפי שם, לא מהראש
- אם הפקודה מבוססת על SPEC:
  - [ ] אימות סעיף-סעיף מול SPEC (טבלה)
  - [ ] SPEC מעודכן? בדוק מול הערכים ב-bina-nutrition skill (לא hardcoded)

### כלים מתקדמים:
- **Monitor:** הרצת pytest (390+ טסטים) → Monitor ברקע, התראה רק על failures. deploy ל-Railway → Monitor על stdout. תמיד grep --line-buffered.
- **/loop:** /loop 5m health של Railway. /loop 30m תוקף WhatsApp token (פג ~מאי 2026). /loop 1h טסטים אוטומטיים.
- **/ultraplan:** תכנון M1 (recipes), M2 (coaching engine). דורש GitHub repo (orsaboni-max/bina-v2).

### טעויות שקרו:
1. שכחת /clear (5+ פעמים)
2. שכחת BINA_FULL_MAP.md (3 פעמים)
3. שכחת Ultrathink (2 פעמים)
4. IDs מהראש במקום מהקטלוג (2 פעמים)
5. פקודה ממסמך ישן — v7 במקום v10 (פעם)
6. שכחת Notion pull בתחילת סשן (פעם)

### סיום פקודת בינה:
[כלים]. Double check everything. עדכן CLAUDE.md + BINA_FULL_MAP.md. git push origin main.

---

## כללים ספציפיים — Steps (steps-site)

### סעיפים ספציפיים:
- **סעיף 4 (skills):** frontend-design, content-research-writer, voice-dna-orsaboni
- **סעיף 11 (עדכון):** עדכן CLAUDE.md בלבד (אין מפה נפרדת)

### אימות נוסף:
- אם הפקודה משנה קוד:
  - [ ] ראיתי את הקוד הרלוונטי בשיחה? אם לא → קודם "הדפס בלי לשנות"
  - [ ] "מה לא לשנות" מפורט? אם לא → הוסף
- אם הפקודה בונה HTML/UI:
  - [ ] CSS — "העתק 1:1 מ-reference"
  - [ ] JS — "var only, לא const/let/arrow"
  - [ ] לוגו — "steps_logo_b64.txt, ~54K, לא 368K"
  - [ ] {% raw %} סביב JS ב-Jinja2?

### כלים מתקדמים:
- **Monitor:** Vercel deploy (npx vercel --prod) → Monitor, התראה רק על שגיאות. לא צריך Monitor לשינויים קטנים.
- **/loop:** /loop 1h בדיקת שהאתר stepsnetanya.co.il מגיב (HTTP 200). /loop 6h בדיקת GA4 (G-5T22VE9YHT) ו-Meta Pixel (1016773848190436). /loop 1d בדיקת 404 בדפי SEO.
- **/ultraplan:** לא רלוונטי לפרויקט הזה.

### טעויות שקרו:
1. שכחת /clear (5+ פעמים)
2. שכחת Ultrathink (2 פעמים)
3. לוגו לא נכון — 368K במקום 54K (פעם)
4. Jinja2 בלי {% raw %} (כמעט קרה)
5. "העתק 1:1" בלי לפרט מה שונה (2 פעמים)

### סיום פקודת Steps:
[כלים]. Double check everything. עדכן CLAUDE.md. npx vercel --prod --yes. git push origin main.

---

## כללים ספציפיים — @orsaboni (תוכן + אינסטגרם)

### סעיפים ספציפיים:
- **סעיף 4 (skills):** content-research-writer + voice-dna-orsaboni + orsaboni-instagram (שלושתם חובה!)
- **סעיף 11 (עדכון):** לא רלוונטי (אין repo ייעודי)
- **סעיף 12 (git push):** לא רלוונטי

### אימות נוסף:
- אם הפקודה יוצרת תוכן:
  - [ ] כולל PubMed PMID לכל טענה תזונתית?
  - [ ] קרא את שלושת ה-skills (content-research-writer + voice-dna + orsaboni-instagram)?
  - [ ] פורמט ברור: hook / גוף / CTA?
- אם הפקודה יוצרת תמונה:
  - [ ] Nano Banana Pro דרך Google Gemini?
  - [ ] פרומפט photorealism ספציפי?
- אם הפקודה עוסקת במתחרים:
  - [ ] Windsor.ai connector / Apify?

### כלים מתקדמים:
- **Monitor:** לא רלוונטי.
- **/loop:** לא רלוונטי.
- **/ultraplan:** תכנון קמפיין תוכן שבועי / חודשי.

### טעויות שקרו:
1. שלחנו פקודת תוכן בלי content-research-writer (פעם)
2. טענה תזונתית בלי PMID (פעם)
(פרויקט פעיל — הרשימה תתעדכן)

### סיום פקודת @orsaboni:
Double check everything. אין git push. אין עדכון CLAUDE.md.

---

## כללים ספציפיים — MEVO

### סעיפים ספציפיים:
- **סעיף 4 (skills):** (יתעדכן כשייבנו skills ל-MEVO)
- **סעיף 11 (עדכון):** עדכן CLAUDE.md בלבד (אין מפה עדיין)

### אימות נוסף:
- אם הפקודה משנה קוד:
  - [ ] ראיתי את הקוד הרלוונטי בשיחה? אם לא → קודם "הדפס בלי לשנות"
  - [ ] "מה לא לשנות" מפורט? אם לא → הוסף

### כלים מתקדמים:
- **Monitor:** deploy pipeline → Monitor, התראה רק על שגיאות. WhatsApp webhook → Monitor עם grep --line-buffered. טסטים → Monitor ברקע.
- **/loop:** /loop 5m health של deployment. /loop 1h test suite אוטומטי. /loop 1d סיכום סטטוס + עדכון Notion.
- **/ultraplan:** כל משימת ארכיטקטורה (API, DB, WhatsApp flows). Deep Plan mode למשימות מורכבות. דורש GitHub repo (orsaboni-max/mevo). לא למשימות קטנות.

### סיום כל פקודת MEVO — חובה:
עדכן Notion work doc (33f6666147bc81748ce8c40f05a98085) אוטומטית אחרי כל שלב.

### טעויות שקרו:
1. שכחת /clear (5+ פעמים)
2. שכחת Ultrathink (2 פעמים)
(פרויקט חדש — הרשימה תתעדכן)

### סיום פקודת MEVO:
[כלים]. Double check everything. עדכן CLAUDE.md. עדכן Notion. git push origin main.

---

## אימות משותף — כל הפרויקטים:

### אם הפקודה גדולה (4+ שלבים):
- [ ] פירוק ל-2 פקודות? (קבועים → פונקציה)
- [ ] שקול /ultraplan במקום פקודה רגילה

### אם הפקודה מריצה קוד קיים (לא משנה):
- [ ] "מה לא לשנות: שום קובץ"
- [ ] אין צורך ב-skills/sub agents/git push

---

## פורמט פקודה:

```
/clear
```

(נפרד! אור מדביק /clear לפני)

```
הרץ /model opusplan

קרא קודם: CLAUDE.md + [קבצים]
קרא skill [שם]

משימה: [תיאור ברור]

--- מה לעשות ---
[פירוט]

--- מה לא לשנות ---
[רשימה מפורשת]

--- בדיקות ---
[מה בודקים + מה Claude מאמת בעצמו]

[כלים]. Double check everything. עדכן [לפי פרויקט]. git push origin main.
```

## כלל אחרון
**אור לא מפתח. פקודה = פקודה אחת מלאה להדבקה. לא שלבים. לא "עכשיו פתח". לא "אחרי זה תעשה".**
