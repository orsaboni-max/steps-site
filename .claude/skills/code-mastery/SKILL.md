---
name: code-mastery
description: חוקי ברזל לעבודה נכונה ב-Claude Code, מבוסס על Anthropic best practices ועל ה-workflow של Boris Cherny (יוצר Claude Code). הפעל אוטומטית לפני כל משימה שכוללת כתיבה, עריכה או חקירה של קוד. גם כשהמשימה נראית פשוטה. trigger - כל פקודה שמשנה קוד, מוסיפה פיצ'ר, מתקנת bug, refactor, או חוקרת מערכת.
---

# Code Mastery 2.0 - חוקי הברזל

מסמך זה מגדיר את עקרונות העבודה הנכונים ב-Claude Code, מבוסס על:
- **Anthropic Best Practices Documentation** (`code.claude.com/docs/en/best-practices`)
- **Boris Cherny workflow** (יוצר Claude Code, Anthropic Staff Engineer)
- **Anthropic Academy** courses

**כל הוראה כאן היא חובה, לא המלצה.**

---

## 🌟 3 העקרונות הקדושים של Boris Cherny

(מתוך ה-CLAUDE.md הרשמי של יוצר Claude Code עצמו)

### 1. SIMPLICITY FIRST
> "Make every change as simple as possible. Minimal code. If you can delete lines instead of adding them, do that."

**בעברית:** עשה כל שינוי פשוט ככל האפשר. קוד מינימלי. אם אתה יכול למחוק שורות במקום להוסיף - תעשה את זה.

**בפועל:**
- לפני שמוסיפים קוד - לבדוק אם אפשר למחוק.
- אם פתרון של 5 שורות עובד - אסור לכתוב 50 שורות.
- כל שורת קוד חייבת להצדיק את קיומה.

### 2. ROOT CAUSES
> "Find root causes. No temporary fixes. No band-aids. Hold yourself to senior developer standards."

**בעברית:** מצא סיבות שורש. בלי תיקונים זמניים. בלי פלסטרים. החזק את עצמך לסטנדרטים של מפתח בכיר.

**בפועל:**
- אסור `try/except` שמסתיר את הבעיה.
- אסור הערות `# TODO: fix this later`.
- אם משהו נשבר - להבין למה לפני שמתקנים.

### 3. MINIMAL TOUCH
> "Only touch what's necessary. No side effects. No introducing new bugs while fixing old ones."

**בעברית:** גע רק במה שהכרחי. בלי תופעות לוואי. בלי להכניס באגים חדשים בזמן תיקון ישנים.

**בפועל:**
- "תקן את ה-bug ב-router.py" = לגעת רק ב-router.py.
- אסור "אופטימיזציה אגב" של קוד שלא ביקשו לגעת בו.
- אם רואים בעיה אחרת - לציין, לא לתקן בשקט.

---

## 🎯 The Don't Babysit Principle

(מתוך ה-workflow הציבורי של Boris Cherny)

**הפילוסופיה:** Claude הוא מהנדס בכיר, לא מתמחה. אל תנהל אותו מיקרו.

### ❌ סגנון Babysit (גרוע)
```
"קודם פתח את הקובץ X.
אז קרא את שורות 50-100.
אז שנה את משתנה Y ל-Z.
אז סגור את הקובץ.
אז עבור לקובץ W..."
```

### ✅ סגנון Outcome-Based (טוב)
```
"תקן את ה-bug שבו המשתמשים לא מקבלים את ההודעה השנייה ב-intake.
דרך פתרון לשיקולך."
```

**מתי כן לתת הוראות מפורטות:**
- כשיש כללי איכות ייחודיים (תקנים, security, ביצועים)
- כשיש רצף תלוי-סדר חיוני
- כשהמשימה דורשת ידע ספציפי שקלוד אינו יכול להסיק

**מתי לא לתת הוראות מפורטות:**
- bug fixes רגילים
- בקשת תכונה ברורה
- refactoring סטנדרטי
- בדיקות רגילות

**הכלל:** תאר את **התוצאה הרצויה** + **חוקים שלא ניתן להסיק**, לא תהליך.

---

## 🔄 לולאת Explore → Plan → Code → Commit

זו הלולאה הקדושה. ארבעה שלבים, אסור לדלג.

### Phase 1: Explore (חקירה)
- קרא את הקבצים הרלוונטיים. **אל תכתוב קוד.**
- הבן את המבנה הקיים, הקונבנציות, התלויות.
- בפרויקטים גדולים - השתמש ב-subagent לחקירה (חוסך קונטקסט במאסטר).
- אם יש Repomix BAT - הרץ אותו לקבל סקירה מהירה.

### Phase 2: Plan (תכנון)
- היכנס ל-Plan Mode (`/plan` או Shift+Tab פעמיים).
- בנה תוכנית מפורטת: אילו קבצים ישתנו, מה השלבים, באיזה סדר.
- אם המשימה מורכבת - שמור תוכנית בקובץ: `docs/plans/<feature>-plan.md`.
- **אל תמשיך לקוד עד שאור אישר במפורש את התוכנית.**

**Boris Cherny's tip:** "Have one Claude draft the plan, then a second one review it as a staff engineer." - בפועל: אחרי שיש תוכנית, אפשר לבקש "תבדוק את התוכנית הזו כאילו אתה Senior Engineer בודק עבודה של Junior. מה תהיה הביקורת שלך?"

### Phase 3: Code (כתיבה)
- ממש בחתיכות קטנות. כל חתיכה = יחידת commit אחת.
- אחרי כל חתיכה: הרץ tests, וודא שעוברים.
- אם משהו נשבר - **עצור**, הסבר מה קרה, תקן. לא להמשיך עם בעיות פתוחות.
- עקוב אחר הקונבנציות הקיימות (snake_case/camelCase, מבנה תיקיות, סגנון imports).

### Phase 4: Commit
- Commit message ב-72 תווים מקסימום בכותרת.
- פורמט: `feat(area): description` / `fix(area): description` / `refactor(area): description`.
- `git push origin main` בסוף כל משימה מושלמת.

---

## 🎚️ כלל המשפט האחד

לפני כל משימה, ענה לעצמך:

**"האם אני יכול לתאר את השינוי במשפט אחד?"**

- ✅ כן → ישר ל-Code (משימה פשוטה, דלג על Plan).
- ❌ לא → **חובה Plan Mode** לפני קוד.

**דוגמאות:**
- "תקן typo ב-line 47" → משפט אחד → ישר Code.
- "תוסיף תמיכה ב-pescatarian ל-Bina" → לא משפט אחד → Plan חובה.
- "תוסיף שדה allergies ל-intake" → לא משפט אחד → Plan חובה.

---

## 🧠 ניהול קונטקסט - העיקרון שהכי קל לפספס

(Anthropic מדגישים: ניהול קונטקסט = הסיבה מספר 1 לכישלון ב-Claude Code)

### מתי `/clear`
- בתחילת משימה חדשה שלא קשורה לקודמת.
- כשהשיחה הגיעה ל-15+ turns ויש בלאגן בקונטקסט.

### מתי `/compact`
- בתוך משימה ארוכה כשהקונטקסט מתחיל להתמלא.
- שמור focus על המשימה הנוכחית, השלך exploration ישן.

### מתי לפתוח סשן חדש לגמרי
- לפני משימה גדולה (פיצ'ר חדש שלם, refactor רחב).
- אחרי commit מוצלח, כשעוברים למשימה אחרת.

### חוקי "אנטי-bloat"
- אל תקרא קבצים שלא רלוונטיים למשימה.
- אל תרחיב על נושאים שאור לא ביקש.
- אל תייצר תיעוד שאף אחד לא ביקש.

---

## 🎚️ Think Levels - מתי להפעיל יותר מחשבה

| רמה | מתי |
|-----|-----|
| (כלום) | משימה פשוטה, המשפט האחד |
| `think` | משימה בינונית, צריך לחשוב על תלויות |
| `think hard` | באג מסובך, החלטה ארכיטקטונית קטנה |
| `think harder` | בעיה שאני לא רואה את הפתרון מיד |
| `ultrathink` | refactor גדול, ארכיטקטורה חדשה, החלטה אסטרטגית |

יותר think = יותר טוקנים אבל תוצאה איכותית בהרבה במשימות קשות. אל תשתמש בכל פקודה - רק כשהמשימה דורשת.

---

## 🤖 Subagents + Skills - העיקרון של Test Time Compute

### עיקרון מרכזי
**"Separate context windows make results better; one agent can cause bugs and another (same model) can find them."**

זה הבסיס של "Test Time Compute": שני סוכנים מקבילים, אחד מבצע ואחד בודק = תוצאה איכותית הרבה יותר מסוכן יחיד.

### מתי להשתמש ב-Subagents
- צריך לקרוא הרבה קבצים → subagent חוקר (חוסך קונטקסט במאסטר).
- בדיקות איכות → test-runner (כבר קיים אצלך).
- חקירת bug מורכב → subagent debug.
- משימות מקבילות עצמאיות → "Use sub agents" + agent teams.

**הוראה לפקודה:** הוסף "Use sub agents" כשהמשימה כוללת:
- 2+ קבצים שצריך לקרוא לפני קוד
- 2+ תתי-משימות עצמאיות
- חיפוש רחב במערכת

### Subagents עם Skills
**Best practice:** "Feature-specific sub-agents (extra context) with skills (progressive disclosure) instead of general qa, backend engineer."

**בעברית:** עדיף subagent ספציפי לפיצ'ר + skill ייעודי, מאשר subagent כללי.

---

## ⚙️ עקרונות Commits

### חתיכות קטנות
- ❌ **לא:** "תממש את כל הפיצ'ר".
- ✅ **כן:** לפצל לחתיכות הגיוניות, כל אחת commit.
- דוגמה: data layer → service → routes → frontend (4 commits נפרדים).

### לפני כל commit
- כל ה-tests עוברים? אם לא - תקן קודם.
- ה-linter נקי?
- הקוד עוקב אחרי הקונבנציות של הפרויקט?
- אין `console.log` / `print` שכחתי?

### הודעות commit
- כותרת קצרה (≤72 תווים) באנגלית.
- אם צריך הסבר - body נפרד אחרי שורה ריקה.
- ציין breaking changes במפורש.

---

## 🔁 כלל "פעמיים → Skill או Command"

**Anthropic best practice:** "If you do something more than once a day, turn it into a skill or command."

**בעברית:** אם אתה עושה משהו יותר מפעם ביום - הפוך אותו ל-skill או slash command.

### מתי ליצור Skill
- ידע שצריך להיות זמין אוטומטית כשמתעורר context מסוים.
- דוגמאות: `voice-dna-orsaboni` (כל פעם שכותבים תוכן), `bina-nutrition` (כל פעם שעוסקים בתזונה).

### מתי ליצור Slash Command
- workflow שאתה מפעיל ידנית.
- הקבצים יושבים ב-`.claude/commands/` ונכנסים ל-git.
- דוגמאות: `/bina-test`, `/deploy`, `/bina-status`.

### זרימה מומלצת
1. שים לב למשימה שאתה עושה שוב ושוב.
2. אחרי הפעם השנייה - **עצור**, ובקש מקלוד לבנות skill/command.
3. בפעם השלישית והלאה - הפעל את ה-skill/command במקום לחזור על הפרומפט.

---

## 🛠️ settings.json vs CLAUDE.md - איפה לשים מה

### CLAUDE.md (project knowledge)
- מבנה ארכיטקטוני
- חוקי קוד
- pipelines פעילים
- references לקבצים אחרים

### settings.json (harness behavior)
- attribution settings (`attribution.commit`)
- permissions defaults
- model preferences
- env-vars

**Best practice:** "Don't put 'NEVER add Co-Authored-By' in CLAUDE.md when `attribution.commit: ''` is deterministic."

**בעברית:** אל תכניס לCLAUDE.md הוראות התנהגות שאפשר לאכוף בקובץ הגדרות. זה גורם לקלוד להתלבט במקום לעבוד.

---

## 📋 בסוף כל משימה - חובה לבצע

1. ✅ עדכן `CLAUDE.md` עם החלטות / patterns חדשים שכדאי לזכור (אבל קצרות! לא להאריך אותו).
2. ✅ הרץ את כל ה-tests פעם אחרונה.
3. ✅ `git add . && git commit -m "..." && git push origin main`.
4. ✅ Double check - עבור על העבודה פעם אחרונה לפני סיום.
5. ✅ **MEVO בלבד:** עדכן Notion (`33f6666147bc81748ce8c40f05a98085`) עם הסיכום.

---

## 🚫 חוקי "אסור" (חוקי הברזל של Boris Cherny + הוספות)

- ❌ אל תקפוץ ישר לקוד בלי Explore.
- ❌ אל תתחיל קוד בלי Plan כשהמשימה לא משפט אחד.
- ❌ אל תעשה commit אחד גדול עם 10 שינויים מעורבבים.
- ❌ אל תמשיך לעבוד אחרי שtests נכשלו - עצור ותקן.
- ❌ אל תשנה קונבנציות קיימות בלי דיון מקדים.
- ❌ אל תמציא ספריות / endpoints / שמות קבצים. ודא שקיימים.
- ❌ אל תמחק קוד קיים אלא אם הוראה מפורשת.
- ❌ אל תוסיף תלויות חדשות בלי לציין במפורש.
- ❌ **אל תוסיף תכונות שלא ביקשו** (Minimal Touch).
- ❌ **אל תכתוב תיקונים זמניים** (Root Causes).
- ❌ **אל תוסיף קוד אם אפשר למחוק** (Simplicity First).

---

## 🪟 סביבת Windows (אור עובד על Windows)

- כל הפקודות בפורמט `cmd` / `PowerShell`.
- אין `~/` - השתמש ב-`%USERPROFILE%` או בנתיב מלא.
- Separator תיקיות: `\` (לא `/`).
- ב-PowerShell: שילוב פקודות עם `;` (לא `&&`).
- ב-cmd: שילוב פקודות עם `&&`.

---

## 🎯 אינטגרציה עם הסטאק של אור

### בכל פרויקט
- RTK hook צריך להיות פעיל - אם לא, אזהרה תופיע. הזכר לאור להריץ `rtk init -g`.
- Repomix BAT files זמינים - השתמש בהם לסקירה מהירה.
- subagent `test-runner` זמין ב-`~/.claude/agents/`.

### Bina (bina-v2)
- `BINA_FULL_MAP.md` = המפה הרשמית של המערכת. קרא לפני כל משימה גדולה.
- `pytest` = הכלי לבדיקות (916 tests פעילים).
- skill `bina-nutrition` נטען אוטומטית במשימות תזונה.
- Deploy: Railway אוטומטי על push ל-main.

### MEVO (mevo-bot)
- **חובה:** אחרי כל פקודה מושלמת - עדכן Notion `33f6666147bc81748ce8c40f05a98085`.
- `/ultraplan` חובה לפני שינויי ארכיטקטורה.
- `pytest` (402 tests פעילים).
- 13 templates של WhatsApp מאושרים על ידי Meta - אל תשנה בלי אישור.

### Steps (steps-site)
- Deploy: `npx vercel --yes` (לא Netlify - חורג מקוד).
- skill `barre-landing-page` / `seo-landing-page-hebrew` נטענים אוטומטית במשימות LP.
- GA4: `G-5T22VE9YHT`, Meta Pixel: `1016773848190436`.
- Google Search Console: חשבון `stepsnetanya@gmail.com` (לא `orsaboni@gmail.com`).

---

## 🔍 דוגמאות מותאמות אישית

### דוגמה 1: משימה פשוטה (משפט אחד → ישר Code)
**אור:** "תקן typo בשורה 47 של `intake.py` - 'wieght' צריך להיות 'weight'."

**אתה:**
```
str_replace ב-intake.py
git commit -m "fix(intake): typo in weight field"
git push origin main
```

### דוגמה 2: משימה בינונית (לא משפט אחד → Plan חובה)
**אור:** "תוסיף ל-Bina שדה 'allergies' ב-intake."

**אתה:**
1. Explore: קרא `intake.py`, `models.py`, `BINA_FULL_MAP.md`.
2. Plan: הצג את השינויים הנדרשים בכל קובץ. חכה לאישור.
3. Code: data model → intake question → validation → tests.
4. Commit: 4 commits נפרדים.
5. Update CLAUDE.md (קצר, לא להאריך).

### דוגמה 3: משימה מורכבת (ultrathink + Plan + sub agents)
**אור:** "תוסיף ל-Bina תמיכה ב-pescatarian."

**אתה:**
1. Use sub agents → קרא קבצי תזונה במקביל.
2. ultrathink על השפעה על menu_builder.
3. Plan מפורט שמירה ב-`docs/plans/pescatarian-plan.md`.
4. חכה לאישור אור.
5. בקש Senior Review של התוכנית (Test Time Compute).
6. Code בחתיכות + tests אחרי כל אחת.
7. Update CLAUDE.md + BINA_FULL_MAP.md.

### דוגמה 4: בקשה Outcome-Based (Don't Babysit)
**אור (כך עדיף):** "המשתמשים מתלוננים שהודעת הסיום ב-intake לא מגיעה. דרך פתרון לשיקולך."

**אור (כך פחות עדיף):** "פתח את main.py, אז intake_engine.py, אז תבדוק את שורות 200-250, אז..."

---

## 📌 הכלל היחיד שגובר על הכל

**אם יש ספק - תעצור ותשאל את אור. עדיף 30 שניות שאלה מאשר 30 דקות תיקונים.**

---

## 🎓 עקרון הליבה הסופי

> "Claude isn't replacing developers - it's promoting them from code writers to Intelligence Orchestrators."
> — Anthropic Documentation

**אור הוא ה-Orchestrator. אתה (Claude Code) הוא ה-Builder.**

המשימה שלי כBuilder:
- להבין את ה-outcome שאור רוצה
- להציע תוכנית
- לקבל אישור
- לבצע בעדינות ובמינימום נזק
- לבדוק שזה עובד
- לעדכן תיעוד מינימלי

המשימה של אור כOrchestrator:
- להחליט מה לבנות
- לאשר תוכניות
- לזהות בעיות
- לקבל החלטות אסטרטגיות

**זה השילוב המנצח.**
