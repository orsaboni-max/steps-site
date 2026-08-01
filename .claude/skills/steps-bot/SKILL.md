---
name: steps-bot
description: >-
  הבוט החי של STEPS (steps-brain-bot ב-Railway, טלגרם "דני") — מה הוא, איפה הקוד,
  איך deployים אליו בבטחה, מה ה-jobs שרצים, ואיך מוסיפים watcher/פיצ'ר. בנוי
  מהשקה אמיתית (9/6/26) כדי לא לגלות מאפס שוב. השתמש בכל פעם שנוגעים בבוט: deploy,
  הוספת התראה/watcher/דוח, תיקון, בדיקת בריאות, או חקירת מה הבוט עושה. Triggers:
  הבוט, steps-brain, דני, deploy לבוט, להוסיף התראה, watcher, להעלות לבוט, railway up.
---

# STEPS — הבוט החי (steps-brain-bot / "דני")

> 🎯 מטרה: לדעת **לבד ומיד** מה הבוט, איפה, ואיך נוגעים בו בבטחה — בלי לגלות מאפס ובלי לשגע את אור.
> 🔒 **deploy לבוט = שינוי ייצור → דורש "go" מפורש של אור** (ראה למטה את המשפט המדויק). הבנייה/קוד — לבד; ה-deploy — באישור.

---

## 0. מה זה ואיפה (עוגנים)
- **בוט טלגרם** בשם "דני" — עוזר שיווק 24/7 לאור: עונה בטלגרם + מריץ jobs מתוזמנים (התראות לידים, מכירות, דוחות, CAPI).
- **קוד מקומי (מקור ה-deploy):** `C:\Users\USER\steps-brain` — Python, APScheduler + python-telegram-bot. **לא git** (deploy דרך CLI). **זו התיקייה היחידה עם קוד הבוט** (steps-bot/steps-marketing = שלדים ריקים, להתעלם).
- **Railway:** project **steps-brain** (`d5041466-d398-4f61-98c1-790b884ed59c`).
  - 🟢 service **steps-brain-bot** (`dcc9582d-acfc-4922-be89-a528cc124a5e`, env `43cc93ac-9013-422f-a11f-16eb1997879e`) = **הבוט החי. deploy רק לכאן.**
  - 🟢 service **arbox-mcp** = Online (שרת Arbox MCP).
  - ⚰️ service **steps-brain** = **כפיל מת (offline). לא לגעת / לא להעלות לשם.**
  - volume `steps-brain-bot-volume` ב-`/app/data` (DB של דני + state של lead_alert — שורד deployments).
- **טלגרם:** owner chat id **8751868205** (אור). bot token ב-`.env` (`STEPS_TELEGRAM_BOT_TOKEN`).

---

## 1. ⭐ Deploy לבוט (CLI — לא GitHub!)
> ה-DEPLOY.md בתיקייה מתאר GitHub — **התעלם**, ה-deploy האמיתי הוא CLI (`railway up`).

**ה-CLI כבר מחובר** (`railway whoami` → orsaboni@gmail.com). ה-env vars יושבים על Railway ו**נשמרים בין deploys** (railway up מעלה רק קוד).

```bash
cd /c/Users/USER/steps-brain
unset RAILWAY_TOKEN                       # ה-token ב-.env פג; ה-CLI מחובר בלעדיו
python -m compileall -q app/              # שער: לא להעלות build שבור
git add -A && git commit -m "<מה השתנה>"  # נקודת-שמירה לפני deploy (git מקומי מ-10/6; .env+data/ מוחרגים)
railway up --service steps-brain-bot --detach   # ⚠️ חובה --service (אחרת ילך לכפיל המת!)
```
- build ~3-5 דק' (Docker + pip). מצב: Railway → service → Deployments ("Building"→"Deploying"→**ACTIVE / Deployment successful**).
- **אימות אחרי deploy (logs):** `Application started` · `Scheduler started` · `🔔 Lead alert loop registered` · `check_new_leads ... executed successfully` · **אפס Traceback/ImportError**.
- 🔄 **Rollback:** Railway → Deployments → deploy קודm → "Redeploy". (זמין תמיד — רשת ביטחון.)

### 🔒 הרשאה (הקלסיפייר חוסם deploy לא-מאושר)
מערכת הבטיחות חוסמת deploy/יצירת-טוקן לבוט החי. **לפני deploy — אור חייב לכתוב במפורש:**
> **"אני מאשר לעדכן את הבוט החי steps-brain-bot"**
(אישור כללי כמו "תעשה" לא מספיק לקלסיפייר ל-production deploy.)

---

## 2. ה-Jobs המתוזמנים (APScheduler, ב-`app/bot.py`)
| job | תדירות | מה עושה |
|---|---|---|
| **lead_alert** (`check_new_leads`) | 2 דק' | ליד חדש ב-Arbox → **התראת טלגרם** (שם/טלפון/מקור/וואטסאפ) **+ משימה על הכרטיס** (`_create_lead_task`). תמיד דולק. |
| **sales_watcher** (`check_new_sales`) | 2 דק' | התראות מכירה (חידוש/חדש/רכישה). |
| **membership_events** | 2 דק' | ביטולים + הקפאות (אותות נטישה). |
| **zap_watchdog** (`check_zap_health`) | 10 דק' | ליד נכנס ל-Meta אבל לא ל-Arbox (Zap נכשל) → התראה. |
| **reminders** (`fire_due_reminders`) | 1 דק' | תזכורות שאור ביקש. |
| **morning_briefing** | 7:30 | בריפינג יומי (ביצועים+לידים+מתחרים). |
| **weekly_report** / **monthly_report** | א' 8:00 / 1-לחודש | דוחות. |
| **weekly_source_report** | א' 8:30 | לקוחות משלמות לפי מקור ליד. |
| **weekly_actions** (`send_weekly_actions`) | א' 8:05 | 🛠 מנוע פעולות: SCALE/HOLD/REFRESH/KILL לכל adset + כפתורי אישור. **דולק** (ACTION_ENGINE_ENABLED=true מ-9/6). |
| **funnel_report** (`send_funnel_report`) | א' 8:35 | 🔻 המשפך הקשיח: לידים→היכרות(₪50)→מנוי, מהקופה (salesReport). תמיד דולק. |
| **weekly_creative** (`send_weekly_creative`) | א' 9:00 | 🎨 שיר+תום: 3 קונספטים מבוססי-נתון + קופי. **דולק** (WEEKLY_CREATIVE_ENABLED=true מ-9/6). |
| **capi_sync** | 30 דק' | Arbox→Meta Purchase. **🟢 LIVE** (CAPI_ENABLED=true, test_mode=false מ-7/6). |
| **leads_intake** (`sync_new_leads`) | 5 דק' | Meta→Arbox ליד+משימה. **כבוי** (LEADS_INTAKE_ENABLED) — אנחנו עושים דרך Zapier. |

### פקודות טלגרם + עברית פשוטה (10/6)
`/weekly` `/funnel [ימים]` `/dashboard` `/health` `/reminders` — וגם **בעברית בלי סלאש** (התאמה מעוגנת, לא substring): "המשפך" / "משפך 180" / "סבב" / "דשבורד". כפתורי אישור inline: `act:approve|reject|details:<id>` → `handle_callback`.

### 🖥 דשבורד חי + קליטת מודיעין (web thread בתוך הבוט)
uvicorn ב-daemon thread (רק כש-`DASHBOARD_ENABLED=true`): `https://steps-brain-bot-production.up.railway.app` — `/dashboard` + `/dashboard.json` (מוגנים `?key=DASHBOARD_TOKEN`) + **POST `/intel/{trends|competitors}.json`** (כך המודיעין השבועי מגיע ל-volume — כתיבה מקומית לבדה לא מגיעה לענן!). קוד: `app/web/`.

### 💰 שער הכסף
הצעות-כסף (תקציב/הפעלה) עוברות דרך `_pending_actions` + אישור; הפעלת ACTIVE מותרת רק ל-`STEPS_OWNED_ENTITY_IDS` (action_executor.py). כיבוי מותר תמיד. +20% תקציב מקס.

---

## 3. קבצים מרכזיים
- `app/bot.py` — נקודת כניסה + רישום scheduler jobs (post_init).
- `app/triggers/lead_alert.py` — התראת ליד + יצירת משימה (`check_new_leads`, `_send_alert`, `_create_lead_task`).
- `app/triggers/leads_intake.py` — intake Meta→Arbox (כבוי) + קבועי משימה (TASK_TYPE_NEW_INTERESTED=83674).
- `app/integrations/arbox_api.py` — `ArboxClient`: get_leads/create_lead/create_task/update_lead_status/send_message.
- `app/agents/` — conductor / orchestrator / action_executor / leads / reminders (מוח ה-AI של דני).
- `app/config.py` — settings (env). `app/prompts/*.he.txt` — פרומפטים של דני (קול דני → סקיל `dani-voice`).

## 4. ערכי Arbox נעולים (לשימוש ב-create_task/create_lead)
location **18259** (פולג) · status **1603** (Not Contacted) · task_type **83674** (מתעניין חדש) · source קמפיין קידס **99396** (אימוני ילדים). API: header apiKey (`~/.arbox_key`), base api.arboxapp.com/index.php/api/v2. **UA דפדפן** — httpx ברירת-מחדל עובר את Cloudflare; בקשה בלי UA בכלל → 1010.

## 5. להוסיף watcher/התראה חדשה (הדפוס)
1. כתוב פונקציה `async def check_X(bot=None)` ב-`app/triggers/` — non-fatal (try/except, לוג), בלי PII בלוג.
2. רשום ב-`app/bot.py` בתוך הסקדולר: `scheduler.add_job(check_X, IntervalTrigger(minutes=N), kwargs={"bot": app.bot}, id="x", replace_existing=True)`.
3. state פרסיסטנטי → `data/<name>_state.json` (volume `/app/data`).
4. `python -m compileall -q app/` → deploy (סעיף 1) באישור אור.

## 6. בדיקת בריאות (read-only)
- Railway → project steps-brain → **steps-brain-bot** → View logs. לחפש: `Running job "check_new_leads" ... executed successfully`. אם offline/Crashed → אין התראות.
- ה-Railway MCP המחובר לסשן = **Bina** (לא steps-brain!) → לבוט STEPS דרך ה-CLI/דפדפן.
- שליחת טלגרם ידנית לבדיקה: POST `api.telegram.org/bot<TOKEN>/sendMessage` עם chat_id=8751868205.

## 7. מהמורות נעולות
- **deploy רק ל-steps-brain-bot** (לא steps-brain הכפיל המת). חובה `--service steps-brain-bot`.
- **Bina Zap (366606913)** אכל פעם את מכסת Zapier המשותפת → השאר כבוי.
- env vars על Railway (לא ב-CLI) → railway up לא נוגע בהם.
- שינוי קוד = deploy מלא (railway up). אין hot-reload.
- קול/פרומפטים של דני → סקיל `dani-voice`. השקת מודעות/לולאת לידים → `steps-leadgen-launch`.
