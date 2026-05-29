# PROJECT STATE — STEPS
עודכן: 2026-05-28

## תמונת מצב
STEPS Fitness הוא סטודיו כושר לנשים בפולג, נתניה.
המוצרים המרכזיים: GYM, MOVE, פילאטיס מכשירים, STEPS KIDS, נערות, ו-Bina.
אור רוצה להפסיק לשלם לסוכנות שיווק 2,500 ₪ בחודש, ולהפעיל יחד עם Codex מערכת שיווק פנימית.

## מה חי עכשיו
לפי HANDOFF.md ו-marketing/STATUS.md:
- קמפיין פילאטיס נערות פעיל ב-Meta.
- קמפיין STEPS KIDS 12-15 פעיל.
- קמפיין סוכנות "סניף פולג" פעיל.
- צינור חלקי: Meta/WhatsApp -> Upgrade 360 -> Arbox.

## ממצאי Arbox שאומתו ב-2026-05-28
חיבור API ישיר ל-Arbox עובד מול:
- /users: 702 רשומות.
- /membership: 2,915 רשומות.
- /leads: 4,290 רשומות.

ב-30 הימים 2026-04-28 עד 2026-05-28, סניף פולג:
- 99 לידים.
- 39 לידים בסטטוס Not Contacted.
- Facebook הוא מקור הלידים הגדול בחלון זה עם 39 לידים.

## בעיית מדידה פתוחה
הכלי leads_summary הקיים לא אמין מספיק להמרה אמיתית.
נמצא ש-lead.user_fk לא מתחבר ישירות ל-membership.user_fk, membership.id או users.id.
גם הצלבת טלפון/אימייל מצאה מעט התאמות בלבד.
צריך לבנות שכבת מדידה חדשה, כנראה עם Make.com או endpoint נוסף, לפני שמצהירים על CPA אמיתי.

## מצב מבנה קבצים
מבנה marketing טוב בבסיסו:
- marketing/brand — מותג וטון.
- marketing/campaigns — בריפים וקמפיינים.
- marketing/creative — נכסי קריאייטיב.
- marketing/ops — חיבורים ותפעול.
- marketing/reports — דוחות.
- marketing/research — מחקר.

פערים לסידור בהמשך:
- יש נכסי קריאייטיב גם בשורש הפרויקט.
- צריך לקבוע מקור אמת יחיד ל-arbox_server.py.
- העבודה כרגע בתוך worktree של Claude; בהמשך כדאי לפתוח ענף/תיקיית Codex נקייה.

## Arbox Codex MCP
ב-2026-05-28 נבנה חיבור MCP מקומי חדש ל-Codex בקובץ `C:\Users\USER\mcp-servers\arbox_codex_mcp.js`.
החיבור מחזיר כברירת מחדל סיכומים בלבד, בלי שמות/טלפונים/מיילים.
הוגדרו 5 כלים: health check, סיכום לידים, לידים לא מטופלים, סיכום רכישות מנוי, ובדיקת שיוך.
ייתכן שצריך לפתוח סשן Codex חדש כדי שהכלים יופיעו ישירות ברשימת הכלים.

## דוח לידים לא מטופלים
ב-2026-05-28 נוצר דוח טיפול ללידים בסטטוס Not Contacted.
הדוח המסכם ללא פרטים אישיים נמצא ב-`marketing/reports/not-contacted-leads-2026-05-28.md`.
קובץ CSV פרטי עם פרטי טיפול נמצא תחת `.codex-private/arbox/`, והתיקייה הוכנסה ל-`.gitignore`.

## Lead pipeline SOP
ב-2026-05-28 נוצר מקור אמת לצינור הלידים:
`marketing/ops/lead-pipeline-sop.md`.

הצינור הרצוי:
Meta Instant Form -> Make -> Arbox lead -> משימה/אחראי -> Upgrade 360 WhatsApp -> עדכון סטטוס -> מדידת שיעור/מנוי -> Meta CAPI.

לא לבנות קמפיין חדש לפני שבוצע ליד בדיקה שמוכיח שהצינור עובד מקצה לקצה.

## Meta lead forms map
ב-2026-05-28 מופו בקריאה בלבד טפסי Lead Gen שמחוברים למודעות.
נוצר דוח: `marketing/reports/meta-lead-forms-map-2026-05-28.md`.

ממצא חשוב: הקמפיין הפעיל `סניף פולג 18.11.25` משתמש בכמה טפסים שונים, לא בטופס אחד בלבד.
צריך לוודא שכל הטפסים הפעילים מחוברים ל-Make/Arbox/Upgrade 360 לפני שמניחים שהצינור תקין.

באותו יום נוצר גם דוח מיפוי מודעות פעילות:
`marketing/reports/active-lead-ads-pipeline-map-2026-05-28.md`.

ממצא חשוב: 7 המודעות הפעילות בקמפיין הסוכנות יצרו 39 לידים ב-30 יום.
זה זהה למספר הלידים ב-Arbox בסטטוס `Not Contacted` ממקור Facebook באותו חלון זמן, ולכן צריך לבדוק אם הלידים נכנסים אבל לא מטופלים/לא מתעדכנים.

## Arbox lead fields audit
ב-2026-05-28 נבדקו שדות הלידים ש-Arbox מחזירה.
נוצר דוח: `marketing/reports/arbox-lead-fields-audit-2026-05-28.md`.

ממצא חשוב: Arbox מחזירה מקור כללי (`Facebook`) וסטטוס, אבל לא מחזירה בשדות הגלויים מזהה קמפיין/טופס/מודעה.
כל 39 הלידים ממקור Facebook בסטטוס `Not Contacted` הם בלי אחראי טיפול.

## Lead pipeline build spec
ב-2026-05-28 נוצר מפרט בנייה לצינור:
`marketing/ops/lead-pipeline-build-spec.md`.

ההמלצה כרגע: לא להחליף מיד את הצינור הקיים, אלא לבדוק קודם אם Upgrade 360 יכול להגדיר אחראי/סטטוס/משימה/metadata בארבוקס.
אם לא, בונים תרחיש Make חדש במצב בדיקה בלבד: Meta Form -> Make -> Arbox Create Lead -> Arbox Create Task -> Upgrade 360 WhatsApp.

## Kids lead form recovery
ב-2026-05-28 נבדקו שני קמפייני הילדים/נערות שקלוד בנה.
נוצר דוח תיקון: `marketing/ops/kids-lead-form-recovery-plan.md`.

ממצא: שני הקמפיינים הפעילים הם Click-to-WhatsApp:
- `STEPS KIDS - Pilates Nearot - WhatsApp` (`120245060573530590`)
- `STEPS KIDS 12-15` (`120244862377350590`)

יש גם שלד Lead Form מושהה:
`STEPS KIDS 12-15 - Lead Form - May2026` (`120245018823660590`), אבל נכון לבדיקה הוא לא צינור עובד.

הדרך המומלצת: להשאיר את WhatsApp חי, ולבנות במקביל גרסת Lead Form מושהית על הדף/טופס שמחובר ל-Upgrade 360/Arbox, ואז לבצע ליד בדיקה.

נוצרו גם קבצי פנייה ל-Upgrade 360:
- `marketing/ops/upgrade-360-lead-form-request.md`
- `marketing/ops/upgrade-360-whatsapp-message.md`

הבדיקה מול Meta הראתה שהטוקן הקיים מאפשר קריאת מודעות, אבל לא מאפשר קריאה/ניהול ישיר של טפסי Lead Form.
לכן צריך או הרשאת דף/Lead Ads מתאימה, או ביצוע דרך Upgrade 360/Business Manager.

עדכון מאור: קמפיין הסוכנות מחובר כולו ל-Upgrade 360.
לכן אפשר להתקדם לפי מסלול הסוכנות כ-blueprint, בלי להמתין להסבר כללי מ-Upgrade.
עדיין צריך ליד בדיקה כדי לוודא שהליד של STEPS KIDS נכנס לארבוקס עם שיוך ואחראי נכונים.

ניסיון ביצוע 2026-05-28:
- ניסיון על דף `100998226019465` נחסם: אין הרשאת יצירת מודעות על הדף.
- על דף `815909245241691` נוצרו Ad Set מושהה `120245215791720590` ו-Creative `3890652731241497`.
- יצירת המודעה עצמה נחסמה על ידי Meta כי תנאי Lead Ads לא אושרו לדף `815909245241691`.
- לא הופעלה מודעה ולא נוצרה מודעה פעילה.

עדכון לפי צילום מסך של אור: במסך Meta הדף `815909245241691` נראה מאושר לתנאי Lead Ads.
לכן החסם המעשי אינו הדף עצמו אלא המסלול האוטומטי: דרך API Meta עדיין חוסמת יצירת מודעת Lead Form, ו-Codex לא הצליח להתחבר ל-Chrome של אור כי חסר/לא עובד גשר Codex Chrome Extension.

עדכון נוסף: אור הציג צילום מסך שבו Codex Chrome Extension במצב `Connected`.
למרות זאת, כלי ההפעלה הפנימי של Codex ל-Chrome נכשל לפני שליטה בלשונית.
ניסיון API נוסף ליצור מודעה מושהית מתוך Ad Set `120245215791720590` ו-Creative `3890652731241497` עדיין נחסם על ידי Meta עם הודעת `Terms of Service Not Accepted`.
אור אישר לפתוח Chrome דרך Codex; נפתח חלון Chrome חדש על `Profile 2`, אבל כלי השליטה בלשונית עדיין נכשל.

חסם נוכחי: לחבר/לתקן את Codex Chrome Extension כדי שאפשר יהיה להשלים את יצירת מודעת Lead Form מתוך הדפדפן המחובר של אור, או לבצע את הצעדים ידנית בליווי Codex.

## Meta snapshot
ב-2026-05-28 בוצעה קריאה בלבד ל-Meta.
נוצר דוח ב-`marketing/reports/meta-readonly-snapshot-2026-05-28.md`.
ממצא מרכזי: קמפיין הסוכנות `סניף פולג 18.11.25` הוציא ₪3,012.56 ב-30 יום ודיווח 77 leads.
באותו חלון Arbox מציג 99 לידים בפולג, מתוכם 39 Not Contacted ממקור Facebook.
צריך להצליב מול Make/Arbox events לפני החלטה על כיבוי או שינוי.
