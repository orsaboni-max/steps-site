# TASKS — STEPS
עודכן: 2026-05-28

## דחוף
- [x] לחבר/לסדר Arbox כ-MCP או כלי Codex נקי, בלי טוקן בקוד. נבנה `arbox_codex_mcp.js`; ייתכן שדורש סשן Codex חדש כדי להופיע ככלי.
- [ ] לתקן את leads_summary כך שלא יסיק המרה מתוך lead.user_fk.
- [x] להוציא דוח 39 לידים Not Contacted ב-30 הימים האחרונים, עם מקור וגיל ליד, בלי לחשוף פרטים בצ׳אט. נוצר דוח ב-`marketing/reports/not-contacted-leads-2026-05-28.md` ו-CSV פרטי ב-`.codex-private/arbox/`.
- [ ] להבין מי אחראי לענות ללידים: אור / Upgrade 360 / הסוכנות / מישהו אחר.
- [x] להגדיר SOP מסודר לצינור לידים Meta -> Make -> Arbox -> Upgrade 360 -> סטטוסים -> מדידה. נוצר `marketing/ops/lead-pipeline-sop.md`.
- [x] למפות בקריאה בלבד את טופסי Meta הפעילים ואת החיבור שלהם לקמפיינים. נוצר `marketing/reports/meta-lead-forms-map-2026-05-28.md`.
- [x] למפות מודעות פעילות בקמפיין הסוכנות לפי טופס, דף, לידים ו-CPL. נוצר `marketing/reports/active-lead-ads-pipeline-map-2026-05-28.md`.
- [x] לבדוק אילו שדות Arbox מחזירה ללידים והאם יש מזהי קמפיין/טופס/מודעה. נוצר `marketing/reports/arbox-lead-fields-audit-2026-05-28.md`.
- [ ] למצוא את תרחיש Make שמקבל Lead Ads ומוודא אם הוא יוצר ליד בארבוקס או רק שולח התראה.
- [ ] לבדוק שכל טופסי הלידים הפעילים בקמפיין `סניף פולג 18.11.25` מחוברים ל-Make/Arbox, לא רק טופס `24484335131190836`.
- [ ] לבדוק אם 39 הלידים הפעילים ממודעות Meta הם אותם 39 לידים ב-Arbox בסטטוס Not Contacted.
- [ ] להגדיר חוק: כל ליד Facebook חדש מקבל אחראי טיפול אוטומטי ולא נשאר בלי בעלים.
- [x] לכתוב מפרט בנייה לצינור ולהחליט בין Upgrade 360 כשער ראשי לבין Make כשער ראשי. נוצר `marketing/ops/lead-pipeline-build-spec.md`.
- [ ] לבדוק ב-Upgrade 360 אם אפשר להוסיף אחראי/סטטוס/משימה/metadata לפני בניית Make חדש.
- [ ] לבדוק אם Arbox מאפשר פתיחת משימה אוטומטית לליד דרך API/Make.
- [ ] לבצע ליד בדיקה רק אחרי אישור אור, ולוודא שהוא נכנס לארבוקס + Upgrade 360.
- [x] לבדוק למה שני קמפייני הילדים של קלוד הגיעו ל-WhatsApp ולא לטופס Lead Form. נוצר `marketing/ops/kids-lead-form-recovery-plan.md`.
- [ ] לבנות/להשלים גרסת Lead Form מושהית לקמפיין ילדים על הדף/טופס שמחובר ל-Upgrade 360/Arbox.
- [x] לבדוק Lead Gen ToS והרשאות Lead Ads לדף הרלוונטי לפני הפעלת קמפיין ילדים בטופס. במסך של אור הדף `815909245241691` נראה מאושר, אבל יצירת מודעה דרך API עדיין נחסמת. אין הרשאת יצירת מודעות על `100998226019465`.
- [ ] לחבר Codex ל-Chrome של אור / לתקן Codex Chrome Extension, כדי להשלים את יצירת מודעת Lead Form מתוך המסך המחובר של Meta.
- [ ] אחרי שחיבור Chrome עובד, ליצור מודעת Lead Form מושהית מתוך Creative `3890652731241497` ו-Ad Set `120245215791720590`, בלי להפעיל אותה.
- [ ] אם חיבור Chrome לא עובד גם אחרי רענון Codex, לבצע עם אור ליווי ידני קצר בתוך Ads Manager: ליצור מודעה חדשה כבויה בתוך Ad Set `120245215791720590`, לבחור טופס ליד מתאים, לשמור כטיוטה/מושהה בלבד.
- [x] להכין פנייה מסודרת ל-Upgrade 360 לחיבור טופס ילדים לארבוקס. נוצר `marketing/ops/upgrade-360-lead-form-request.md`.
- [x] להכין הודעת WhatsApp קצרה ל-Upgrade 360. נוצר `marketing/ops/upgrade-360-whatsapp-message.md`.

## חשוב
- [ ] לחבר Make/אירועי Arbox להמרות אמיתיות, כי lead.user_fk לא מספיק אמין. ראה marketing/ops/arbox-codex-mcp.md.

## חשוב
- [x] למפות קמפיינים חיים ב-Meta בקריאה בלבד. נוצר `marketing/reports/meta-readonly-snapshot-2026-05-28.md`.
- [x] לבנות ספר הפעלה רשמי לפי Meta ל-Performance/Advantage+/AI. נוצר `marketing/ops/meta-official-performance-playbook.md`.
- [ ] לבדוק איפה ב-Make.com קיימים אירועי Lead Converted / Purchase / Renew / Cancel.
- [ ] להצליב קמפיין הסוכנות `סניף פולג 18.11.25`: Meta מדווח 77 leads מול Arbox שמציג 39 Not Contacted ממקור Facebook.
- [ ] לקבוע מקור אמת יחיד ל-arbox_server.py.
- [ ] לבדוק אילו גישות עדיין אצל הסוכנות.

## בהמשך
- [ ] לבנות דוח שבועי: Meta + Arbox + המלצות פעולה.
- [ ] לבנות רעיונות קריאייטיב שבועיים לפי מתחרים ונתונים.
- [ ] לבנות Meta MCP ייעודי לקריאה, ואז טיוטות בלבד.
- [ ] לסדר תיקיות קריאייטיב ולנקות נכסים בשורש הפרויקט.
- [ ] לפתוח ענף Codex נקי במקום worktree של Claude.

## לא לעשות בלי אישור אור
- [ ] לא לשנות תקציבים.
- [ ] לא להפעיל/לכבות קמפיינים.
- [ ] לא לפרסם מודעות.
- [ ] לא לשלוח הודעות ללקוחות.
- [ ] לא למחוק נכסים או להסיר הרשאות.

