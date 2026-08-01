---
name: steps-leadgen-launch
description: >-
  Runbook מקצה-לקצה להשקת מודעת לידים (Instant Form) ל-STEPS — מהטופס ועד שהליד
  נכנס ל-Arbox מתויג, עם כל החיבורים, קריאות ה-API, המהמורות והאימות. בנוי מהשקה
  אמיתית שעבדה (9/6/26). השתמש בכל פעם שמעלים/משכפלים מודעת לידים חדשה, מחליפים
  טופס במודעה חיה, או מחברים טופס חדש ל-Arbox. Triggers: להעלות מודעה, מודעת לידים,
  טופס לידים חדש, לשכפל קמפיין, להחליף טופס, לחבר ליד ל-Arbox, lead form, leadgen.
---

# STEPS — השקת מודעת לידים מקצה-לקצה (Runbook מוכח)

> 🎯 מטרת הסקיל: שאדע **לבד**, בלי לשאול את אור ובלי "לא מצליח", להשיק מודעת לידים שלמה: טופס → מודעה → Zapier → Arbox מתויג → אימות. כל פרט כאן אומת חי ב-9/6/26.
> 🔒 **שום כסף בלי "go" מפורש של אור.** קודם PAUSED/preview, הדלקה רק באישור. אבל **כל הבנייה והחיבור** — אני עושה לבד עד הסוף.

---

## 0. עוגנים (כל המזהים במקום אחד)

| נושא | ערך |
|---|---|
| Meta token | `C:\Users\USER\meta-token-temp.txt` (StepsAds, System User, לא פג). Graph `v21.0`. |
| Token scopes | ads_management, ads_read, pages_show_list, pages_read_engagement, pages_manage_ads, business_management. **חסר: `leads_retrieval` + `pages_manage_metadata`** → אי-אפשר לקרוא לידים/לנהל webhooks דרך הטוקן הזה. |
| חשבון מודעות | `act_9773300439396945` (ILS) |
| דף הלידים | **815909245241691** = "סטודיו סטפס - STEPS Fitness Center" (≠ STEPS Pilates Studio!) |
| Pixel/CAPI | 1016773848190436 (CAPI חי, test_mode=false) |
| **Zap לידים** | **367117682** "STEPS - Facebook Leads to Arbox" (Zapier בתשלום = טריגר מיידי) |
| חיבור FB ב-Zapier | **orsaboni@gmail.com #2** (החיבור שעובד אחרי reconnect 9/6. החיבור הישן לא ראה את הדף אחרי שעבר לעסק) |
| Arbox API key | `~/.arbox_key` (= 1033ce61-13f4-4fe7-a9cd-38833265a1cf) · base `https://api.arboxapp.com/index.php/api/v2` · header `apiKey` |
| Arbox: location | **18259** (סניף פולג) · status **1603** (Not Contacted) · task_type **83674** (מתעניין חדש) · assignee **56753** (אור) |
| Arbox source (קידס) | **99396** "אימוני ילדים" (= התג שה-Zap שלנו שם → ככה מזהים ליד "שלנו") |
| טלפונים | אור 0525177743 · שותף (אור תורג'מן) 0527927575 |

---

## 1. הטופס — הלקח הכי חשוב (אל תשרוף כסף)

**טופס מנצח = שם מלא + טלפון בלבד. אפס שאלות.** (נתוני חשבון: טפסים פשוטים = 47–53 לידים; טופס עם שאלת גיל = 2 לידים בלבד.)
- סוג: **More volume** (`is_optimized_for_quality=false`), שדות `FULL_NAME` + `PHONE` (ממולאים מראש מפרופיל FB).
- **אסור** להוסיף שאלת CUSTOM "סתם" — כל שאלה = פחות לידים.
- טפסים ב-Meta **immutable** — אי-אפשר לערוך שאלות אחרי יצירה. צריך שינוי? יוצרים טופס חדש.

### יצירת טופס חדש (Graph API)
```bash
POST /v21.0/815909245241691/leadgen_forms
  name="STEPS <נושא> - שם+טלפון בלבד <תאריך>"
  locale="en_US"
  questions=[{"type":"FULL_NAME"},{"type":"PHONE"}]
  privacy_policy={"url":"https://www.stepsnetanya.co.il","link_text":"מדיניות פרטיות"}
  thank_you_page={...}  # להעתיק מטופס עובד קיים
  follow_up_action_url="http://www.facebook.com/stepsnetanya"
```
לאמת שדות של טופס קיים: `GET /<form_id>?fields=name,status,leads_count,questions{type,label}`

---

## 2. הקריאייטיב + חיבור הטופס למודעה
> 🛠️ **כלים (אומת 9/6/26):** ניהול/יצירת/עריכת קמפיין-adset-מודעה + ראייה + ריגול = **Meta Ads MCP** (`mcp__4b041d40-...__ads_*`, 3 חשבונות, read+write). **יצירת טופס לידים (`/leadgen_forms`) + העלאת תמונה (`/adimages`) = Graph API ישיר בלבד** (אין כלי MCP). יצירת creative אפשר ב-MCP (`ads_create_creative`) או Graph. **לא דפדפן.**

**להחליף טופס במודעה חיה = ליצור creative חדש עם הטופס החדש, ולהחליף ב-ad.**
1. שכפל את ה-object_story_spec של הקריאייטיב הקיים, החלף את **כל** ה-`lead_gen_form_id` לטופס החדש:
```bash
POST /v21.0/act_9773300439396945/adcreatives
  name="<שם> - form <new_form_id>"
  object_story_spec={...אותו spec, lead_gen_form_id מוחלף בכל child_attachment...}
```
2. החלף ב-ad (זה נוגע בכסף → **go של אור**):
```bash
POST /v21.0/<ad_id> {creative:{creative_id:"<new_creative_id>"}}
```
3. אמת: `GET /<ad_id>?fields=name,effective_status,creative` + שלוף את ה-form מה-creative לוודא שהוא החדש.

> קרוסלה / preview / פורמטים → ראה סקיל `steps-carousel-upload`.

---

## 3. ⭐ הפַּס: Zapier מחבר את הטופס ל-Arbox

מבנה ה-Zap (367117682, 2 שלבים): **New Lead (FB) → Create New Lead (Arbox)**.

### מיפוי שלב ה-Arbox (נעול — אומת חי)
| שדה Arbox | ערך |
|---|---|
| First Name | ← Full Name (מהטופס) |
| Phone | ← Phone Number (מהטופס) |
| Location | סניף פולג (18259) |
| Gender | female |
| Status | Not Contacted (1603) |
| **Source** | **אימוני ילדים (99396)** ← התג שמזהה ליד "שלנו" |

### 🔴 איך מצביעים את ה-Zap על טופס חדש (הדרך שעבדה 9/6)
עורך Zapier **קופא לסירוגין** ושדות פייסבוק לא נטענים אם החיבור ישן. סדר הפעולות:

1. **אם שדה הטופס תקוע ("Loading", 6 ספינרים, אין combobox):** החיבור של פייסבוק שבור (כי הדף בבעלות עסק). **הפתרון: לחבר מחדש את פייסבוק** — Setup tab → "Change account for Facebook Lead Ads" → "Connect a new account" → **OAuth popup (חלון נפרד שהתוסף לא שולט בו → אור מאשר אותו, חייב לסמן את כל הדפים/העסקים).** נוצר חיבור `orsaboni@gmail.com #2`. אחרי זה הטפסים נטענים (לפעמים צריך "Refresh fields" + להמתין ~30ש').
2. **אם הטיוטה פגומה** (שלב תקוע שאי-אפשר למחוק): published view → Versions → **"Delete draft"** (לא נוגע ב-v המפורסם) → "Edit this Zap" לטיוטה נקייה.
3. **לשנות את הטופס:** Configure tab של הטריגר → combobox "List of Forms" → לבחור את הטופס החדש (חיפוש לפי שם/ID). אם JS-click לא פותח → לחיצת-עכבר אמיתית על הקואורדינטות.
4. **Test trigger** → "Continue with selected record" (מוצא רשומת דגימה → מאמת את הטריגר).
5. **Publish:** כפתור Publish לפעמים **לא מרונדר** (באג עורך). פתרונות לפי סדר: טאב חדש → רענון → **restart לכרום** (מתקן עורך קפוא). חלון "Publish new version" → ללחוץ Publish.
6. **לאמת פרסום:** `/editor/367117682/published/367117682/fields` → לוודא Form = החדש, Account = #2, ה-Zap **ON**.

### מהמורות עורך Zapier (לחסוך זמן)
- screenshot נתקע על העורך הכבד → להשתמש ב-`read_page`/`javascript_tool` (DOM) במקום.
- שדות נטענים **לסירוגין** — לפעמים צריך רענון/המתנה. זה לא בהכרח שבור.
- חלונות OAuth/טופס-בדיקה = חלונות נפרדים שהתוסף לא רואה → רק אור יכול ללחוץ בהם.

---

## 4. Arbox API ישיר (כשצריך לכתוב/לקרוא בלי Zapier)

⚠️ **חובה User-Agent של דפדפן** אחרת Cloudflare חוסם (שגיאה 1010 "browser_signature_banned"):
```python
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
headers={'apiKey':KEY,'Content-Type':'application/json','Accept':'application/json','User-Agent':UA}
```
- **קריאת לידים:** `GET /leads` (מוחזר מערך; מיין לפי `id` desc; שדות: id, first_name, phone, source_fk, status, created_at, user_fk).
- **יצירת ליד:** `POST /leads` (שדות חובה כולל first_name+phone+location). ה-Arbox MCP הוא **קריאה-בלבד** — כתיבה דרך Zapier MCP `create_new_lead` או API ישיר.
- **יצירת משימה על כרטיס:** `POST /tasks` — שדות חובה: **`locationBoxFk` (18259), `targetableType`, `taskTypeId` (83674)** (+ targetableId=מזהה הליד, assignee 56753, date). זה פותר את מה שה-Zap לא יכל (ה-Zap לא חושף את מזהה-הליד למיפוי).

---

## 5. ✅ אימות מקצה-לקצה (השער לפני "מוכן" / לפני go לתקציב)

**אסור לסמן "מוכן" בלי לראות ליד אמיתי שלנו נכנס ל-Arbox.** איך:
1. **בייסליין:** `GET /leads` → לרשום את ה-id העליון.
2. **ליד-בדיקה:** Lead Ads Testing Tool (`developers.facebook.com/tools/lead-ads-testing`) → בחר דף STEPS Fitness Center (הטופס נבחר אוטומטית) → "Create lead" → **למלא+לשלוח את הטופס** (חלון נפרד → אור). *או* להמתין לליד אמיתי ראשון.
3. **מעקב:** poll את `GET /leads` עד שמופיע ליד עם **`source_fk=99396`** (= שלנו). סקריפט מוכן: `~/steps_lead_monitor.py` (רץ ברקע, לוג ב-`~/steps_lead_monitor.log`).
4. **אימות סופי:** ליד עם source 99396 + טלפון תקין + status Not Contacted = הפַּס עובד. בדוק גם **כפילות** (טלפון פעמיים).
5. **בדיקה צולבת:** Zapier run history (`zapier.com/app/history`) — לוודא שה-Zap שלנו **רץ בהצלחה** (לא Errored). ליד עם `source_fk=null` = **לא** דרך הפַּס שלנו (סוכנות/אתר/וואטסאפ).

### הבחנה קריטית
- **ליד "שלנו"** = source_fk **99396** (ה-Zap שלנו תייג). 
- **ליד שלא שלנו** = source/status `null` → הגיע ממקור אחר. **אל תספור אותו כהצלחה של הפַּס.**

---

## 6. מהמורות נעולות (אל תיתקע עליהן שוב)

- **הדף בבעלות עסק** → החיבור הישן של פייסבוק ב-Zapier לא רואה טפסים. הפתרון = reconnect (account #2). ה-webhook הישן ממשיך לקבל לידים גם בלי זה, אבל **רשימת הטפסים בעורך לא נטענת** עד reconnect.
- **גם Make וגם Zapier מנויים לדף** (App 576881582383647 Make · 234230510040096 Zapier). סיכון כפילות אם שניהם כותבים לאותו טופס. שלנו = טופס ייחודי + source 99396 → אין התנגשות עם הסוכנות. **לאמת בליד הראשון.**
- **Token חסר leads_retrieval** → אי-אפשר `GET /<form>/leads` דרך Graph (403 #200). לקריאת לידים → Arbox API. להוספת ההרשאה צריך אור (Business Settings → System User → regenerate token).
- **Bina Zap (366606913)** אכל פעם את מכסת Zapier המשותפת (750/חודש) → הקפיא 48 לידים. **להשאיר כבוי.** מכסה משותפת STEPS+Bina.
- ה-Arbox MCP (`mcp__arbox__*`) = קריאה-בלבד. כתיבה = Zapier MCP / API ישיר.

---

## 7. צ'ק-ליסט השקה (העתק-הדבק)

```
[ ] טופס: שם+טלפון בלבד, More volume, אומת questions
[ ] creative חדש עם הטופס + preview תקין לכל מיקום (steps-carousel-upload)
[ ] 🔴 התאמת-סטורי: אם ה-adset רץ על story/reels (auto/all) → preview סטורי; אם פסים שחורים → לתקן (9:16 asset customization / story ייעודי / להגביל placements). חוק מלא: steps-carousel-upload.
[ ] ad מצביע על ה-creative (PAUSED עד go)
[ ] Zap 367117682: טריגר = הטופס החדש, חשבון #2, published, ON
[ ] מיפוי Arbox: source 99396, location 18259, status 1603, female
[ ] אימות: ליד עם source_fk=99396 נכנס ל-Arbox + אין כפילות + Zap run = Success
[ ] go של אור → adset ACTIVE
[ ] עדכון memory: project_steps_LOCKED_FACTS.md
```

---

## 8. הדלקה/כיבוי תקציב (Graph API)
```bash
# כיבוי (בטוח, לא דורש go):
POST /v21.0/<adset_id> {status:"PAUSED"}
# הדלקה (דורש go מפורש של אור):
POST /v21.0/<adset_id> {status:"ACTIVE"}
# אימות:
GET /v21.0/<adset_id>?fields=name,status,effective_status,daily_budget
```
קמפיין KIDS פעיל לדוגמה: campaign 120245796187610590 · adset 120245796218960590 ("פולג 4km · נשים 35-55", ₪30/יום) · ad 120245797902940590.

---

## 8.5 🔴 בדיקה-עצמית אחרי כל העלאה/שינוי מודעה (חובה — לא לדלג)
> אחרי שהעליתי/שיניתי/הדלקתי מודעה — **תמיד** למשוך את העץ המלא ממטא ולאמת. לא להסתמך על "מה שזכרתי שעשיתי".
```bash
GET /<campaign_id>?fields=name,status,objective
GET /<campaign_id>/adsets?fields=name,status,daily_budget
GET /<adset_id>/ads?fields=name,status,effective_status,creative
# לכל ad → לשלוף creative{object_story_spec} ולחלץ lead_gen_form_id
```
**לוודא (ולתקן לבד):**
1. **מבנה צפוי:** מספר הקמפיינים/adsets שתכננתי — בלי כפילויות שנוצרו בטעות.
2. **תקציב:** ה-₪/יום על ה-adset נכון (לא כפול, לא קמפיין-budget לא-מכוון).
3. **טופס נכון בכל מודעה פעילה:** כל ad ב-status ACTIVE משתמש ב-**הטופס/creative הנכון העדכני**. מודעה פעילה עם טופס ישן = תקלה → לתקן.
4. **אין שאריות פעילות:** מודעות/creatives ישנים שצריכים להיות מכובים → **לארכב** (`status=ARCHIVED`, לא hard-delete — בטוח + שמור + לא נדלק בטעות).
5. **effective_status:** אין DISAPPROVED; IN_PROCESS = בבדיקת מטא (נורמלי, לחזור לוודא שעבר ל-ACTIVE).
6. **התאמת-סטורי** (§7 + steps-carousel-upload §65) — אם רץ על story/reels.
- **אסור להכריז "מוכן/הכל תקין" בלי הבדיקה הזו.** זה מה שתופס: טופס ישן שנשאר, מודעת-שארית, תקציב כפול, מודעה תקועה בבדיקה.
- מחיקה לצמיתות של נכס (לא ארכוב) = **go מפורש של אור** (פעולה לא הפיכה).

## 9. ⭐ התראת טלגרם + משימה אוטומטית (דרך הבוט — לא דרך Zapier!)

> **למה לא Zapier?** ניסינו לעשות את המשימה בשלב "Create Task" של Zapier→Arbox — **נכשל**: הפעולה לא חושפת את מזהה-הליד למיפוי, אז המשימה לא נתלית על הכרטיס הנכון. **הבוט פותר את זה** כי הוא קורא את הליד מ-Arbox → יש לו את ה-id → תולה את המשימה נכון. גם ההתראה כבר בבוט, אז שניהם יחד.

### הארכיטקטורה — 2 "עובדים" נפרדים
1. **Zapier** (Zap 367117682): ליד פייסבוק → יוצר כרטיס ב-Arbox (מתויג source 99396). [סעיף 3]
2. **הבוט steps-brain-bot** (Railway, ONLINE): סורק Arbox כל 2 דק' → (א) **התראת טלגרם** לאור, (ב) **יוצר משימה** על הכרטיס.

### הקוד
- קובץ: `C:\Users\USER\steps-brain\app\triggers\lead_alert.py` → `check_new_leads` (רשום ב-`app/bot.py` כ-job IntervalTrigger 2 דק', תמיד דולק).
- התראה: `_send_alert` (שם/טלפון/מקור/אחראית/סטטוס + כפתור וואטסאפ). chat = `settings.steps_owner_telegram_id`.
- משימה: `_create_lead_task` → `arbox.create_task(targetable_type="lead", targetable_id=<lead id>, task_type_id=83674, reminder_date=היום, reminder_time="09:00", location_box_fk=18259)`. non-fatal.
- ה-state (אילו לידים כבר נראו) ב-volume: `data/lead_alert_state.json`.

### Arbox create_task (POST /tasks) — שדות חובה
`locationBoxFk` (18259) · `targetableType` ("lead") · `taskTypeId` (83674 "מתעניין חדש"). אופציונלי: `targetableId` (מזהה הליד), `assignedTo`, `reminderDate`, `reminderTime`, `description`. (UA דפדפן חובה נגד Cloudflare 1010 — httpx ברירת-מחדל עובר.)

### Deploy לבוט החי (Railway, CLI — לא GitHub)
- פרויקט **steps-brain** (d5041466-d398-4f61-98c1-790b884ed59c) · service **steps-brain-bot** (dcc9582d-acfc-4922-be89-a528cc124a5e) · env (43cc93ac-9013-422f-a11f-16eb1997879e). **steps-brain (service) = כפיל מת, offline. arbox-mcp = online.**
- deployed דרך **`railway up`** מתיקיית `C:\Users\USER\steps-brain` (אין GitHub מחובר; env vars יושבים על Railway, נשמרים בין deploys).
- 🔴 **לפני deploy: go מפורש של אור** (שינוי ייצור) + **לאמת שהמקומי = החי** (ייתכן שהמקומי מפגר; ראיה תומכת: ה-logs מריצים אותו סט jobs כמו bot.py המקומי). **rollback זמין** ב-Railway (היסטוריית deploys) אם נשבר.
- טוקן: ב-`.env` של steps-brain (אם פג → ליצור חדש ב-railway.com/account/tokens, אור מחובר).
- אימות אחרי: logs מראים `check_new_leads ... executed successfully` + ליד אמיתי יוצר משימה + עדיין שולח טלגרם.

### בדיקת בריאות הבוט (read-only)
- Railway → project steps-brain → service steps-brain-bot → View logs. לחפש: `Running job "check_new_leads"` + `executed successfully`. אם הבוט offline/crashed → אין התראות.
- ה-Railway MCP המחובר לסשן = **Bina** (לא steps-brain). לבוט STEPS → דרך הדפדפן/CLI.
