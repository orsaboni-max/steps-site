# Arbox Codex MCP
עודכן: 2026-05-28

## סטטוס
נבנה חיבור MCP מקומי חדש ל-Codex:

`C:\Users\USER\mcp-servers\arbox_codex_mcp.js`

החיבור מוגדר ב:

`C:\Users\USER\.codex\config.toml`

המפתח נשמר מחוץ ל-Git:

`C:\Users\USER\.codex\secrets\arbox_api_key.txt`

לא לשים מפתח Arbox בקוד או בקבצי הפרויקט.

## כלים זמינים
- `arbox_health_check` — בדיקת חיבור, ספירות ושדות בלבד.
- `arbox_leads_summary` — סיכום לידים לפי סטטוס ומקור, ללא פרטים אישיים.
- `arbox_open_leads_summary` — לידים Not Contacted לפי מקור וגיל ליד, ללא פרטים אישיים.
- `arbox_acquisition_summary` — סיכום מנויים שהתחילו בחלון זמן, חלוקה מוערכת לחדשות/חידושים/חוזרות.
- `arbox_attribution_probe` — בדיקה מצטברת אם אפשר לשייך לידים למנויים לפי טלפון/אימייל.

## אימות שבוצע
בדיקת self-test ו-JSON-RPC עברה בהצלחה.

ב-30 הימים 2026-04-28 עד 2026-05-28, סניף פולג:
- 99 לידים.
- 39 Not Contacted.
- כל 39 ה-Not Contacted הגיעו ממקור Facebook.
- גיל הלידים הלא מטופלים: 23 מעל 15 יום, 8 בני 8-14 יום, 5 בני 4-7 יום, 2 בני 2-3 ימים, 1 בן 0-1 ימים.

## מגבלה חשובה
לא להשתמש ב-`lead.user_fk` כהוכחת המרה.
נבדק ונמצא שהוא לא מתחבר ישירות למזהי `/membership` או `/users`.
למדידת המרות אמיתיות צריך לחבר Make/אירועי Arbox כמו Lead Converted / Purchase / Renew / Cancel, או endpoint רשמי נוסף.

## הערה להפעלה
ייתכן שה-MCP החדש יופיע ככלי Codex רק אחרי פתיחת סשן חדש או reload של Codex.
עד אז אפשר להריץ את הסקריפט ישירות לבדיקות קריאה בלבד.
